import type { ComponentProps } from 'react'
import { useFormField } from './formFieldContext'

// Igual que Input pero para textos largos (descripción de curso). Toma el
// id, la ayuda y el error del FormField que lo envuelve!
const textareaClasses = [
  'min-h-32 w-full rounded-xl border border-ink/20 bg-surface px-3 py-2 text-base text-ink',
  'placeholder:text-ink/60 transition-colors',
  'focus:border-ink focus:outline-2 focus:outline-offset-0 focus:outline-ink/20',
  'disabled:cursor-not-allowed disabled:bg-cream disabled:opacity-60',
  'aria-invalid:border-danger aria-invalid:focus:outline-danger/20',
].join(' ')

function Textarea({ id, className = '', ...rest }: ComponentProps<'textarea'>) {
  const field = useFormField()
  return (
    <textarea
      id={id ?? field?.id}
      aria-describedby={field?.describedBy}
      aria-invalid={field?.invalid || undefined}
      required={field?.required}
      className={`${textareaClasses} ${className}`}
      {...rest}
    />
  )
}

export default Textarea
