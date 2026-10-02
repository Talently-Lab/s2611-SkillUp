import { useState, type ComponentProps } from 'react'
import { useFormField } from './formFieldContext'

type InputProps = ComponentProps<'input'> & {
  type?: 'text' | 'email' | 'password'
}

const inputClasses = [
  'h-11 w-full rounded-xl border border-ink/20 bg-surface px-3 text-base text-ink',
  'placeholder:text-ink/60 transition-colors',
  'focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink/20',
  'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
  'aria-invalid:border-danger aria-invalid:focus:outline-danger/20',
].join(' ')

function EyeIcon({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-5"
    >
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {!open && <path d="M3 3l18 18" />}
    </svg>
  )
}

function Input({ type = 'text', id, className = '', ...rest }: InputProps) {
  const field = useFormField()
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

  const input = (
    <input
      type={inputType}
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      required={field?.required}
      className={`${inputClasses} ${isPassword ? 'pr-12' : ''} ${className}`}
      {...rest}
    />
  )

  if (!isPassword) return input

  return (
    <div className="relative">
      {input}
      <button
        type="button"
        onClick={() => setShowPassword((visible) => !visible)}
        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
        aria-pressed={showPassword}
        className="absolute inset-y-0 right-0 flex w-12 cursor-pointer items-center justify-center rounded-r-xl text-ink/70 hover:text-ink focus-visible:outline-2 focus-visible:outline-ink"
      >
        <EyeIcon open={!showPassword} />
      </button>
    </div>
  )
}

export default Input