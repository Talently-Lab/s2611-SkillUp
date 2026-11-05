import { z } from 'zod'
import { ApiError, pedir, validar } from './apiClient'

// GET /api/mis-cursos/:slug y POST /api/progreso con la forma que responde hoy
// el backend (studentController.js), que no es la del contrato: el curso viene
// envuelto en "curso" y el texto de la clase se llama "contenido".

// Los nombres de los campos del backend viven solo acá. El schema los pasa a
// los de la app, así que cuando Backend los cambie se toca únicamente esto.
// completada siempre llega (es un IS NOT NULL en la consulta); el resto sale
// directo de la tabla clases, así que los textos opcionales se aceptan null.
const claseSchema = z
  .object({
    id: z.number(),
    titulo: z.string(),
    descripcion: z.string().nullable(),
    contenido: z.string().nullable(),
    url_externa: z.string().nullable(),
    orden: z.number(),
    completada: z.boolean(),
  })
  .transform((c) => ({
    id: c.id,
    titulo: c.titulo,
    descripcion: c.descripcion,
    contenidoTexto: c.contenido,
    // Solo http y https: un "javascript:" cargado por error no llega a ser un link
    urlExterna: c.url_externa && /^https?:\/\//i.test(c.url_externa) ? c.url_externa : null,
    orden: c.orden,
    completada: c.completada,
  }))

const clasesDelCursoSchema = z.object({
  curso: z.object({
    clases: z.array(claseSchema),
  }),
})

// Lo que usa la app
export type Clase = z.output<typeof claseSchema>
// Lo que manda el backend: solo para los mocks
export type ClaseApi = z.input<typeof claseSchema>

// Un 404 cuenta como curso sin clases: el backend lo responde si no está
// inscripto o si el curso no existe, y la página solo pide las clases después
// de confirmar la inscripción.
export async function obtenerClasesDelCurso(slug: string, signal?: AbortSignal) {
  try {
    const datos = await pedir(`/api/mis-cursos/${encodeURIComponent(slug)}`, { signal })
    return validar(clasesDelCursoSchema, datos, 'GET /api/mis-cursos/:slug').curso.clases.sort(
      (a, b) => a.orden - b.orden,
    )
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return []
    throw error
  }
}

// La respuesta ({ mensaje, progreso }) no se lee: con un 2xx la clase ya quedó
// vista
export async function marcarClaseVista(idClase: number) {
  await pedir('/api/progreso', { metodo: 'POST', cuerpo: { id_clase: idClase } })
}
