import type { ReactNode } from 'react'
import { nivelLabel, type Instructor, type Nivel } from '../../lib/courses'

// Solo titulo es obligatorio: el dashboard recibe menos datos que el catálogo
// (ver GET /api/mis-inscripciones en el contrato) y usa la misma card.
type CourseCardProps = {
  titulo: string
  url_portada?: string | null
  categoria?: string
  nivel?: Nivel
  resumen?: string
  instructor?: Instructor
  footer?: ReactNode
}

const cardClasses = [
  'group squircle flex flex-col rounded-2xl border border-ink/10 bg-surface p-4 shadow-sm',
  // Al pasar el mouse se tiñe de naranja suave y las esquinas se cierran un poco
  'transition-[background-color,border-radius,box-shadow] duration-200',
  'ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
  'hover:rounded-sm hover:shadow-xl',
].join(' ')

const imageClasses = [
  'size-full object-cover',
  // Zoom suave cuando el mouse pasa por cualquier parte de la card
  'transition-transform duration-250 ease-[cubic-bezier(0.22,1,0.36,1)]',
  'group-hover:scale-110 motion-reduce:transition-none',
].join(' ')

function initials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function CoverFallback() {
  return (
    <div className="flex size-full items-center justify-center bg-linear-to-br from-primary-soft/60 to-cream">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-12 text-ink/40"
      >
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" />
        <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
      </svg>
    </div>
  )
}

function CourseCard({
  titulo,
  url_portada,
  categoria,
  nivel,
  resumen,
  instructor,
  footer,
}: CourseCardProps) {
  return (
    <article className={cardClasses}>
      <div className="relative aspect-video overflow-hidden rounded-xl">
        {url_portada ? (
          <img src={url_portada} alt="" className={imageClasses} />
        ) : (
          <CoverFallback />
        )}
        {categoria && (
          <span className="absolute top-3 left-3 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-ink">
            {categoria}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-1 flex-col gap-2">
        {nivel && (
          <span className="self-start rounded-md bg-cream px-2 py-0.5 text-xs font-medium text-ink/80">
            Nivel: {nivelLabel[nivel]}
          </span>
        )}

        <h3 className="line-clamp-2 text-xl leading-snug font-bold" title={titulo}>
          {titulo}
        </h3>
        {resumen && <p className="line-clamp-2 text-sm text-ink/70">{resumen}</p>}

        {instructor && (
          <div className="mt-2 flex items-center gap-3 rounded-xl border border-ink/10 bg-cream/60 p-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-sm font-semibold text-ink"
            >
              {initials(instructor.nombre)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{instructor.nombre}</p>
              {instructor.cargo && (
                <p className="truncate text-xs text-ink/70">{instructor.cargo}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {footer && <div className="mt-4">{footer}</div>}
    </article>
  )
}

export default CourseCard