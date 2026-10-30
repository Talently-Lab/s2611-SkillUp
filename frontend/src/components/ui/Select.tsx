import type { ComponentProps } from 'react'
import { useFormField } from './formFieldContext'

// Tomamos el estilo de Input. Esta lista desplegable toma el id, la ayuda y el error
// del FormField que lo contiene. Se usa para nivel y categoría del curso.
const selectClasses = [
  'h-11 w-full rounded-xl border border-ink/20 bg-surface px-3 text-base text-ink',
  'transition-colors cursor-pointer',
  'focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink/20',
  'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
  'aria-invalid:border-danger aria-invalid:focus:outline-danger/20',
].join(' ')

function Select({ id, className = '', children, ...rest }: ComponentProps<'select'>) {
  const field = useFormField()
  return (
    <select
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      required={field?.required}
      className={`${selectClasses} ${className}`}
      {...rest}
    >
      {children}
    </select>
  )
}

export default Select
