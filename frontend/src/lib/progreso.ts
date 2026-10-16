import type { Inscripcion } from './inscripciones'

// Cuentas del progreso de un curso. Sin React para poder usarlas en cualquier
// lado (dashboard, detalle, aula).

export type EstadoCurso = 'en_progreso' | 'completado'

// Entero de 0 a 100. Un curso sin clases cuenta como 0, no como NaN.
export function porcentaje(completadas: number, total: number) {
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((completadas / total) * 100)))
}

// Completado cuando vio todas las clases. Un curso sin clases sigue en progreso.
export function estadoCurso(
  inscripcion: Pick<Inscripcion, 'clases_completadas' | 'curso'>,
): EstadoCurso {
  const total = inscripcion.curso.cantidad_clases
  return total > 0 && inscripcion.clases_completadas >= total ? 'completado' : 'en_progreso'
}
