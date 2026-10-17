type ProgressBarProps = {
  // Entero de 0 a 100 (ver porcentaje() en lib/progreso.ts)
  valor: number
  // Qué progresa, para el lector de pantalla: "Progreso de React desde cero"
  label: string
  className?: string
}

// El porcentaje va siempre escrito al lado: la información no depende solo del
// color de la barra.
function ProgressBar({ valor, label, className = '' }: ProgressBarProps) {
  const ancho = Math.min(100, Math.max(0, valor))

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div
        role="progressbar"
        aria-valuenow={ancho}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2 flex-1 overflow-hidden rounded-full bg-cream"
      >
        <div className="h-full rounded-full bg-primary" style={{ width: `${ancho}%` }} />
      </div>
      {/* aria-hidden: el lector ya lo lee de aria-valuenow */}
      <span aria-hidden="true" className="w-10 text-right text-sm font-semibold tabular-nums">
        {ancho}%
      </span>
    </div>
  )
}

export default ProgressBar
