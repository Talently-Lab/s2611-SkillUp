import type { ReactNode, Ref } from 'react'

type Variant = 'error' | 'success'

type AlertProps = {
  variant?: Variant
  // Con ref el formulario puede mover el foco al Alert cuando aparece
  ref?: Ref<HTMLDivElement>
  className?: string
  children: ReactNode
}

const variants: Record<Variant, string> = {
  error: 'border-danger/30 bg-danger/10 text-danger',
  success: 'border-success/30 bg-success/10 text-success',
}

function AlertIcon({ variant }: { variant: Variant }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 size-5 shrink-0"
    >
      <circle cx="12" cy="12" r="9" />
      {variant === 'error' ? <path d="M12 7.5v5M12 16h.01" /> : <path d="m8 12 3 3 5-6" />}
    </svg>
  )
}

function Alert({ variant = 'error', ref, className = '', children }: AlertProps) {
  return (
    <div
      ref={ref}
      role="alert"
      tabIndex={-1}
      className={`flex gap-3 rounded-xl border px-4 py-3 text-sm font-medium
        focus:outline-2 focus:outline-offset-2 focus:outline-ink ${variants[variant]} ${className}`}
    >
      <AlertIcon variant={variant} />
      <p>{children}</p>
    </div>
  )
}

export default Alert
