import { useEffect, useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'

type Errores<T> = Partial<Record<keyof T, string>>

// Lógica compartida de Login y Registro: valida con zod, maneja el estado de
// envío y mueve el foco al primer campo con error o al Alert del error general.
// mensajeError es el texto del Alert: cada formulario tiene el suyo.
export function useAuthForm<S extends z.ZodType<Record<string, unknown>>>(
  schema: S,
  enviar: (datos: z.infer<S>) => Promise<void>,
  mensajeError: string,
) {
  const [errores, setErrores] = useState<Errores<z.infer<S>>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  const alertRef = useRef<HTMLDivElement>(null)
  const campoConError = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (errorGeneral) alertRef.current?.focus()
  }, [errorGeneral])

  // El foco se mueve después del render, cuando el campo ya tiene aria-invalid y
  // el mensaje conectado, así el lector de pantalla lee el error al llegar.
  useEffect(() => {
    campoConError.current?.focus()
    campoConError.current = null
  }, [errores])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErrorGeneral(null)

    const resultado = schema.safeParse(Object.fromEntries(new FormData(event.currentTarget)))

    if (!resultado.success) {
      // Un solo mensaje por campo: el primero que falló
      const { fieldErrors } = z.flattenError(resultado.error)
      const primeros: Record<string, string | undefined> = {}
      for (const [campo, mensajes] of Object.entries(fieldErrors)) {
        primeros[campo] = (mensajes as string[] | undefined)?.[0]
      }
      // El primero en el orden de la pantalla, no en el del esquema
      campoConError.current =
        Array.from(event.currentTarget.elements).find(
          (el): el is HTMLElement =>
            el instanceof HTMLElement && 'name' in el && Boolean(primeros[el.name as string]),
        ) ?? null
      setErrores(primeros as Errores<z.infer<S>>)
      return
    }

    setErrores({})
    setEnviando(true)
    try {
      await enviar(resultado.data)
    } catch {
      setErrorGeneral(mensajeError)
    } finally {
      setEnviando(false)
    }
  }

  return { errores, errorGeneral, enviando, alertRef, handleSubmit }
}

// Simula la demora de red mientras no hay backend
export function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
