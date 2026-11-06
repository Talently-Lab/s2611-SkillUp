import { pedir } from './apiClient'
import { extraerDetalle, extraerLista, normalizarCurso, type Course, type Nivel } from './courses'

// Administración de cursos del panel admin (basado en contrato v1)
// Todas las rutas piden token de administrador: sin token el backend responde 401 y con un token de alumno, 403.

// Lo que se manda a la API del backend al crear o editar un curso.
// Backend exige slug y titulo, los demás campos son opcionales.
export type DatosCurso = {
  titulo: string
  slug: string
  descripcion?: string
  resumen?: string
  categoria?: string | null
  nivel?: Nivel
  url_portada?: string | null
  publicado?: boolean
}

// Lista del panel admin: trae también los borradores y el campo publicado.
// El catálogo sigue usando GET /api/courses, que solo trae los publicados
export async function obtenerCursosAdmin(signal?: AbortSignal): Promise<Course[]> {
  const respuesta = await pedir<unknown>('/api/courses/admin/todos', { signal })
  return extraerLista(respuesta).map(normalizarCurso)
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