import { z } from 'zod'
import { pedir } from './apiClient'

// Rutas del brief (docs/api/contrato-api-v1.md, "Propuesto (según brief)").
// Mientras el backend no las tenga, las responde MSW (src/mocks/handlers.ts).

// Forma de la respuesta: es lo único que hay que tocar cuando Backend la defina.
// Los mocks usan estos mismos tipos, así que se ajustan solos.
const cursoInscriptoSchema = z.object({
  id: z.number(),
  slug: z.string(),
  titulo: z.string(),
  url_portada: z.string().nullable(),
  // El backend real la devuelve null en cursos sin categoría
  categoria: z.string().nullable(),
  cantidad_clases: z.number(),
})

export const inscripcionSchema = z.object({
  id_inscripcion: z.number(),
  // A confirmar con Backend: la propuesta es 'activa' y 'cancelada'
  estado: z.enum(['activa', 'cancelada']),
  fecha_inscripcion: z.string(),
  curso: cursoInscriptoSchema,
  clases_completadas: z.number(),
})

const misInscripcionesSchema = z.object({
  datos: z.array(inscripcionSchema),
})

export type CursoInscripto = z.infer<typeof cursoInscriptoSchema>
export type Inscripcion = z.infer<typeof inscripcionSchema>
export type MisInscripciones = z.infer<typeof misInscripcionesSchema>

// Si la respuesta no tiene la forma esperada no es un ApiError a propósito:
// quien la use muestra el mensaje genérico, igual que en el login.
function validar<T>(schema: z.ZodType<T>, datos: unknown, ruta: string): T {
  const resultado = schema.safeParse(datos)
  if (!resultado.success) {
    console.error(`La respuesta de ${ruta} no coincide con el contrato:`, resultado.error)
    throw new Error(`Respuesta inválida de ${ruta}`)
  }
  return resultado.data
}

// 401 sin sesión, 409 si ya estaba inscripto (llegan como ApiError)
export async function inscribirse(courseId: number) {
  const datos = await pedir('/api/enrollments', {
    metodo: 'POST',
    cuerpo: { course_id: courseId },
  })
  return validar(inscripcionSchema, datos, 'POST /api/enrollments')
}

export async function obtenerMisInscripciones(signal?: AbortSignal) {
  const datos = await pedir('/api/enrollments/me', { signal })
  return validar(misInscripcionesSchema, datos, 'GET /api/enrollments/me').datos
}
