import type { ReactNode } from 'react'

type Tone = 'brand' | 'neutral' | 'dark' | 'success' | 'danger'

type BadgeProps = {
  tone?: Tone
  className?: string
  children: ReactNode
}

// Cada pantalla elige el tono según lo que muestra: categoría en brand, nivel en
// neutral, rol admin en dark, inscripción activa en success y cancelada en danger.
const tones: Record<Tone, string> = {
  brand: 'bg-primary text-ink',
  neutral: 'bg-cream text-ink',
  dark: 'bg-ink text-cream',
  success: 'bg-success/10 text-success',
  danger: 'bg-danger/10 text-danger',
}

function Badge({ tone = 'neutral', className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs 
        font-semibold whitespace-nowrap ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  )
}

export default Badge