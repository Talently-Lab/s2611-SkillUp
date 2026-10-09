import { z } from 'zod'
import { invalidarSesion, leerSesion } from './sesion'

// Único punto de contacto con la API (docs/api/contrato-api-v1.md). El resto
// de la app recibe los datos ya parseados o un ApiError, nunca un Response.

export const MENSAJE_SIN_CONEXION =
  'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.'
// Sin texto definido por UX: confirmar
export const MENSAJE_GENERICO = 'Algo salió mal. Intentá de nuevo en unos minutos.'

export class ApiError extends Error {
  // 0 cuando el servidor no respondió
  status: number
  // Errores por campo, solo con el formato propuesto del contrato
  campos?: Record<string, string>

  constructor(status: number, mensaje: string, campos?: Record<string, string>) {
    super(mensaje)
    this.name = 'ApiError'
    this.status = status
    this.campos = campos
  }
}

// El backend hoy responde { error, mensaje } y el contrato propone
// { error: { mensaje, campos } }. Se aceptan los dos: cuando el back cambie,
// solo se toca esto.
const errorActualSchema = z.object({
  error: z.string().optional(),
  mensaje: z.string(),
})

const errorPropuestoSchema = z.object({
  error: z.object({
    mensaje: z.string(),
    campos: z.record(z.string(), z.string()).optional(),
  }),
})

function aApiError(status: number, cuerpo: unknown) {
  const propuesto = errorPropuestoSchema.safeParse(cuerpo)
  if (propuesto.success) {
    return new ApiError(status, propuesto.data.error.mensaje, propuesto.data.error.campos)
  }

  const actual = errorActualSchema.safeParse(cuerpo)
  if (actual.success) return new ApiError(status, actual.data.mensaje)

  return new ApiError(status, MENSAJE_GENERICO)
}

function urlBase() {
  const url = import.meta.env.VITE_API_URL
  if (!url) {
    throw new Error(
      'Falta VITE_API_URL. Copiá frontend/.env.example a frontend/.env, ' +
        'completá la URL del backend y reiniciá el servidor de Vite.',
    )
  }
  return url.replace(/\/+$/, '')
}

type Metodo = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

type Opciones = {
  metodo?: Metodo
  // Se manda como JSON
  cuerpo?: unknown
  signal?: AbortSignal
}

// Hace el pedido y devuelve el JSON de la respuesta (undefined si viene vacía).
// Cualquier falla sale como ApiError. La ruta va con el prefijo: '/api/cursos'.
export async function pedir<T>(ruta: string, { metodo = 'GET', cuerpo, signal }: Opciones = {}) {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (cuerpo !== undefined) headers['Content-Type'] = 'application/json'

  const sesion = leerSesion()
  if (sesion) headers.Authorization = `Bearer ${sesion.token}`

  // Fuera del try: si falta la URL es un error de configuración, no de conexión
  const url = `${urlBase()}${ruta}`

  let respuesta: Response
  try {
    respuesta = await fetch(url, {
      method: metodo,
      headers,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal,
    })
  } catch (error) {
    // Un pedido cancelado a propósito no es un problema de conexión
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new ApiError(0, MENSAJE_SIN_CONEXION)
  }

  const datos = await leerJson(respuesta)

  if (!respuesta.ok) {
    if (respuesta.status === 401) invalidarSesion()
    throw aApiError(respuesta.status, datos)
  }

  return datos as T
}

// Un 204 o un error de un proxy pueden venir vacíos o en HTML: en esos casos
// no hay JSON que leer.
async function leerJson(respuesta: Response): Promise<unknown> {
  try {
    const texto = await respuesta.text()
    return texto ? JSON.parse(texto) : undefined
  } catch {
    return undefined
  }
}
