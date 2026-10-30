import { z } from 'zod'
import { ApiError, pedir, validar } from './apiClient'

// GET /api/mis-cursos/:slug y POST /api/progreso todavía no existen en el
// backend: la forma es la del contrato y mientras tanto la responde MSW
// (src/mocks/handlers.ts).

// Los nombres de los campos del backend viven solo acá. El schema los pasa a
// los de la app, así que cuando Backend los cambie se toca únicamente esto.
const claseSchema = z
  .object({
    id: z.number(),
    titulo: z.string(),
    descripcion: z.string().nullable(),
    contenido_texto: z.string().nullable(),
    url_externa: z.string().nullable(),
    orden: z.number(),
    completada: z.boolean(),
  })
  .transform((c) => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    contenidoTexto: c.contenido_texto,
    // Solo http y https: un "javascript:" cargado por error no llega a ser un link
    urlExterna: c.url_externa && /^https?:\/\//i.test(c.url_externa) ? c.url_externa : null,
    orden: c.orden,
    completada: c.completada,
  }))

const clasesDelCursoSchema = z.object({
  titulo: z.string(),
  clases: z.array(claseSchema),
})

// Lo que usa la app
export type Clase = z.output<typeof claseSchema>
// Lo que manda el backend: solo para los mocks
export type ClaseApi = z.input<typeof claseSchema>

// Un 404 cuenta como curso sin clases: es lo que responde hoy el backend real,
// que todavía no tiene la ruta. 403 si no está inscripto (llega como ApiError).
export async function obtenerClasesDelCurso(slug: string, signal?: AbortSignal) {
  try {
    const datos = await pedir(`/api/mis-cursos/${encodeURIComponent(slug)}`, { signal })
    return validar(clasesDelCursoSchema, datos, 'GET /api/mis-cursos/:slug').clases.sort(
      (a, b) => a.orden - b.orden,
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

// La respuesta no se lee: el contrato todavía no la define, y con un 2xx la
// clase ya quedó vista
export async function marcarClaseVista(idClase: number) {
  await pedir('/api/progreso', { metodo: 'POST', cuerpo: { id_clase: idClase } })
}
