import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react'
import { Link } from 'react-router-dom'
import Spinner from './Spinner'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  fullWidth?: boolean
  // Con "to" se dibuja un Link: el botón navega en vez de ejecutar una acción
  to?: string
  // Para mover el foco al botón (ej. Cancelar al abrir un ConfirmDialog)
  ref?: Ref<HTMLButtonElement>
  children: ReactNode
}

const base = [
  'relative inline-flex items-center justify-center gap-2 overflow-hidden',
  'rounded-xl font-semibold',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
  'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

const variants: Record<Variant, string> = {
  primary: [
    'btn-primary-fill text-ink',
    'transition-[background-position] duration-350 ease-[cubic-bezier(0.22,1,0.36,1)]',
    'not-disabled:hover:bg-left focus-visible:bg-left',
    'motion-reduce:transition-none',
  ].join(' '),
  secondary:
    'border border-ink/20 bg-surface text-ink transition-colors duration-200 not-disabled:hover:bg-cream',
  ghost: 'text-ink transition-colors duration-200 not-disabled:hover:bg-ink/5',
  danger: 'bg-danger text-white transition-colors duration-200 not-disabled:hover:bg-danger/90',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm',
  md: 'h-11 px-4 text-base',
  lg: 'h-12 px-6 text-base',
}

function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  to,
  ref,
  type = 'button',
  disabled,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const classes = [base, variants[variant], sizes[size], fullWidth ? 'w-full' : '', className]
    .join(' ')
    .trim()

  if (to && !disabled && !loading) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classes}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}

export default Button