import { createContext, useContext } from 'react'

type FormFieldContextValue = {
  id: string
  describedBy?: string
  invalid: boolean
  required: boolean
}

// FormField lo llena y el Input lo lee, así el id, el error y la ayuda quedan
// conectados sin pasarlos a mano en cada formulario.
export const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export function useFormField() {
  return useContext(FormFieldContext)
}