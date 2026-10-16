import type { Inscripcion } from '../../lib/inscripciones'
import { estadoCurso, porcentaje } from '../../lib/progreso'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import ProgressBar from '../ui/ProgressBar'
import CoverFallback from './CoverFallback'

type EnrolledCourseCardProps = {
  inscripcion: Inscripcion
}

// Card del dashboard del alumno (FE-15): un curso en el que está inscripto,
// con su progreso. Mismo marco que CourseCard.
function EnrolledCourseCard({ inscripcion }: EnrolledCourseCardProps) {
  const { curso, clases_completadas } = inscripcion
  const completado = estadoCurso(inscripcion) === 'completado'
  const avance = porcentaje(clases_completadas, curso.cantidad_clases)

  return (
    <article className="flex flex-col rounded-2xl border border-ink/10 bg-surface p-4 shadow-sm">
      <div className="relative aspect-video overflow-hidden rounded-xl">
        {curso.url_portada ? (
          <img src={curso.url_portada} alt="" className="size-full object-cover" />
        ) : (
          <CoverFallback />
        )}
        <div className="absolute inset-x-3 top-3 flex justify-between gap-2">
          <Badge tone={completado ? 'dark' : 'brand'}>
            {completado ? 'Completado' : 'En curso'}
          </Badge>
          <Badge>{avance}%</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        <p className="text-xs font-semibold tracking-wider text-ink/70 uppercase">
          {curso.categoria}
        </p>
        <h3 className="line-clamp-2 text-xl leading-snug font-bold" title={curso.titulo}>
          {curso.titulo}
        </h3>
        <p className="mt-auto pt-2 text-sm text-ink/70">
          {clases_completadas} de {curso.cantidad_clases} clases vistas
        </p>
        <ProgressBar valor={avance} label={`Progreso de ${curso.titulo}`} />
      </div>

      <Button
        to={`/mis-cursos/${curso.slug}`}
        variant={completado ? 'secondary' : 'primary'}
        fullWidth
        className="mt-4"
      >
        {completado ? 'Repasar curso' : 'Entrar al curso'}
        {/* Todas las cards tienen el mismo link: el título lo distingue al tabular */}
        <span className="sr-only">: {curso.titulo}</span>
      </Button>
    </article>
  )
}

export default EnrolledCourseCard
