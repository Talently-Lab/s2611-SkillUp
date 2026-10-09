import { z } from 'zod'

// Todo lo que toca localStorage para la sesión pasa por acá. No es React a
// propósito: lo usan tanto el AuthProvider como el apiClient.

export const CLAVE_SESION = 'skillup.sesion'

export const usuarioSchema = z.object({
  id: z.number(),
  correo: z.string(),
  rol: z.enum(['alumno', 'admin']),
  nombre: z.string().optional(),
})

const sesionSchema = z.object({
  token: z.string().min(1),
  usuario: usuarioSchema,
})

export type Usuario = z.infer<typeof usuarioSchema>
export type Rol = Usuario['rol']
export type Sesion = z.infer<typeof sesionSchema>

// Aviso para cuando la sesión se cierra fuera de React (token vencido o un 401
// del servidor). El AuthProvider lo escucha para actualizar el estado.
const avisos = new EventTarget()
const SESION_CERRADA = 'sesion-cerrada'

export function alCerrarseSesion(listener: () => void) {
  avisos.addEventListener(SESION_CERRADA, listener)
  return () => avisos.removeEventListener(SESION_CERRADA, listener)
}

export function guardarSesion(sesion: Sesion) {
  try {
    localStorage.setItem(CLAVE_SESION, JSON.stringify(sesion))
  } catch {
    // Sin localStorage (modo privado, cuota llena) la sesión dura lo que la pestaña
  }
}

export function borrarSesion() {
  try {
    localStorage.removeItem(CLAVE_SESION)
  } catch {
    // Nada que borrar si no hay localStorage
  }
}

// Borra la sesión y avisa a la app. Es lo que usa el apiClient ante un 401.
export function invalidarSesion() {
  borrarSesion()
  avisos.dispatchEvent(new Event(SESION_CERRADA))
}

// Devuelve la sesión guardada, o null si no hay, si está corrupta o si el token
// ya venció. En los dos últimos casos además la borra.
export function leerSesion(): Sesion | null {
  let crudo: string | null
  try {
    crudo = localStorage.getItem(CLAVE_SESION)
  } catch {
    return null
  }
  if (crudo === null) return null

  let datos: unknown
  try {
    datos = JSON.parse(crudo)
  } catch {
    invalidarSesion()
    return null
  }

  const resultado = sesionSchema.safeParse(datos)
  if (!resultado.success || tokenVencido(resultado.data.token)) {
    invalidarSesion()
    return null
  }

  return resultado.data
}

// Lee el campo exp del payload del JWT. No verifica la firma: eso lo hace el
// backend. Si el token no es un JWT o no trae exp, se toma como vigente y será
// el servidor el que responda 401.
function tokenVencido(token: string) {
  const exp = leerPayload(token)?.exp
  if (typeof exp !== 'number') return false
  return exp * 1000 <= Date.now()
}

function leerPayload(token: string): Record<string, unknown> | null {
  const partes = token.split('.')
  if (partes.length !== 3) return null

  try {
    const base64 = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const relleno = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const bytes = Uint8Array.from(atob(relleno), (c) => c.charCodeAt(0))
    const payload: unknown = JSON.parse(new TextDecoder().decode(bytes))
    return typeof payload === 'object' && payload !== null
      ? (payload as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}
