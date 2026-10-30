import { pedir } from './apiClient'
import { extraerDetalle, normalizarCurso, obtenerCursos, type Course, type Nivel } from './courses'

// Administración de cursos del panel admin (basado en contrato v1)
// Todas las rutas piden token de administrador: sin token el backend responde 401 y con un token de alumno, 403.

// Lo que se manda a la API del backend al crear o editar un curso.
// Backend exige slug y titulo, los demás campos son opcionales.
export type DatosCurso = {
  titulo: string
  slug: string
  descripcion?: string
  resumen?: string
  categoria?: string
  nivel?: Nivel
  url_portada?: string | null
  publicado?: boolean
}

// Hoy GET /api/courses devuelve solo los cursos publicados y sin el campo
// publicado, así que el panel todavía no puede listar los borradores. Se le
// pidió a Backend una lista para admin; cuando exista, solo se cambia esto.
export function obtenerCursosAdmin(signal?: AbortSignal): Promise<Course[]> {
  return obtenerCursos(signal)
}

// El backend ignora publicado al crear: todo curso nuevo nace como publicado!

// Se crea el curso, y se espera asíncronamente a que el backend lo devuelva con todos los campos.
export async function crearCurso(datos: DatosCurso): Promise<Course> {
  const respuesta = await pedir<unknown>('/api/courses', { metodo: 'POST', cuerpo: datos })
  return normalizarCurso(extraerDetalle(respuesta))
}

// Método PUT para actualizar el curso existente.
export async function actualizarCurso(id: number, datos: DatosCurso): Promise<Course> {
  const respuesta = await pedir<unknown>(`/api/courses/${id}`, { metodo: 'PUT', cuerpo: datos })
  return normalizarCurso(extraerDetalle(respuesta))
}

// Responde el curso borrado, pero el panel solo necesita saber que se eliminó correctamente.
export async function eliminarCurso(id: number): Promise<void> {
  await pedir<unknown>(`/api/courses/${id}`, { metodo: 'DELETE' })
}