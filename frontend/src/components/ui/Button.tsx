import type { ButtonHTMLAttributes, ReactNode } from 'react'
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
  children: ReactNode
}

const base = [
  'relative isolate inline-flex items-center justify-center gap-2 overflow-hidden',
  'rounded-xl font-semibold transition-colors duration-200',
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
].join(' ')

const variants: Record<Variant, string> = {
  primary: [
    'bg-primary text-ink',
    // Relleno oblicuo con degradado que entra de izquierda a derecha en hover
    'before:absolute before:inset-y-0 before:-left-1/4 before:-z-10 before:w-[150%]',
    'before:-translate-x-full before:-skew-x-20',
    'before:bg-linear-to-r before:from-primary-soft before:to-cream',
    'before:transition-transform before:duration-300 before:ease-[cubic-bezier(0.22,1,0.36,1)]',
    'not-disabled:hover:before:translate-x-0 focus-visible:before:translate-x-0',
    'motion-reduce:before:transition-none',
  ].join(' '),
  secondary: 'border border-ink/20 bg-surface text-ink not-disabled:hover:bg-cream',
  ghost: 'text-ink not-disabled:hover:bg-ink/5',
  danger: 'bg-danger text-white not-disabled:hover:bg-danger/90',
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