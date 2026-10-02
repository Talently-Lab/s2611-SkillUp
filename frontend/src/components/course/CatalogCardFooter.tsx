import Button from '../ui/Button'

type CatalogCardFooterProps = {
  slug: string
  cantidad_clases: number
  duracion_semanas?: number
}

const arrowClasses = [
  // Fuera del flujo del texto, así el texto queda centrado aunque la flecha aparezca
  'absolute top-1/2 left-full ml-2 size-4 -translate-x-2 -translate-y-1/2 opacity-0',
  'transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none',
  'group-hover/btn:translate-x-0 group-hover/btn:opacity-100',
  'group-focus-visible/btn:translate-x-0 group-focus-visible/btn:opacity-100',
].join(' ')

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold tracking-wider text-ink/60 uppercase">{label}</p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  )
}

function CatalogCardFooter({ slug, cantidad_clases, duracion_semanas }: CatalogCardFooterProps) {
  return (
    <div className="border-t border-ink/10 pt-4">
      <div className="mb-4 flex items-end justify-between gap-4">
        <Stat
          label="Duración"
          value={duracion_semanas ? `${duracion_semanas} semanas` : 'A tu ritmo'}
        />
        <div className="text-right">
          <Stat label="Contenido" value={`${cantidad_clases} clases`} />
        </div>
      </div>

      <Button
        to={`/cursos/${slug}`}
        size="lg"
        fullWidth
        className="group/btn squircle shadow-sm"
      >
        <span className="relative">
          Ver más
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className={arrowClasses}
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </span>
      </Button>
    </div>
  )
}

export default CatalogCardFooter