import { useId, type ReactNode } from 'react'
import { FormFieldContext } from './formFieldContext'

type FormFieldProps = {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}

function FormField({ label, hint, error, required = false, children }: FormFieldProps) {
  const id = useId()
  const hintId = `${id}-hint`
  const errorId = `${id}-error`

  // El lector de pantalla lee el error si hay, y si no la ayuda
  const describedBy = error ? errorId : hint ? hintId : undefined

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="text-danger">
            {' '}*
          </span>
        )}
      </label>

      <FormFieldContext.Provider value={{ id, describedBy, invalid: Boolean(error), required }}>
        {children}
      </FormFieldContext.Provider>

      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={hintId} className="text-sm text-ink/70">
            {hint}
          </p>
        )
      )}
    </div>
  )
}

export default FormField