import { useEffect, useRef, useState, type FormEvent } from 'react'
import { z } from 'zod'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'

type Errores<T> = Partial<Record<keyof T, string>>

// Lógica compartida de Login y Registro: valida con zod, maneja el estado de
// envío y mueve el foco al primer campo con error o al Alert del error general.
// mensajesPorEstado tiene los textos del Alert según el status de la API: cada
// formulario tiene los suyos.
export function useAuthForm<S extends z.ZodType<Record<string, unknown>>>(
  schema: S,
  enviar: (datos: z.infer<S>) => Promise<void>,
  mensajesPorEstado: Partial<Record<number, string>>,
) {
  const [errores, setErrores] = useState<Errores<z.infer<S>>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)
  // Dos submits seguidos (Enter + clic) pueden leer el estado enviando viejo,
  // antes del render. El ref cambia en el acto y frena el segundo.
  const enviandoRef = useRef(false)
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
    if (enviandoRef.current) return
    setErrorGeneral(null)
    // Se guarda antes del await: después React ya no deja leer currentTarget
    const form = event.currentTarget

    const resultado = schema.safeParse(Object.fromEntries(new FormData(form)))

    if (!resultado.success) {
      // Un solo mensaje por campo: el primero que falló
      const { fieldErrors } = z.flattenError(resultado.error)
      const primeros: Record<string, string | undefined> = {}
      for (const [campo, mensajes] of Object.entries(fieldErrors)) {
        primeros[campo] = (mensajes as string[] | undefined)?.[0]
      }
      mostrarErroresPorCampo(form, primeros)
      return
    }

    setErrores({})
    enviandoRef.current = true
    setEnviando(true)
    try {
      await enviar(resultado.data)
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setErrorGeneral(MENSAJE_GENERICO)
        return
      }
      // Errores por campo del backend (formato propuesto del contrato). Solo se
      // usan los que corresponden a un campo de este formulario.
      const campos = Object.fromEntries(
        Object.entries(error.campos ?? {}).filter(([campo]) => campoDelForm(form, campo)),
      )
      if (Object.keys(campos).length > 0) {
        mostrarErroresPorCampo(form, campos)
        return
      }
      setErrorGeneral(
        mensajesPorEstado[error.status] ??
          (error.status === 0 ? MENSAJE_SIN_CONEXION : MENSAJE_GENERICO),
      )
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }

  function mostrarErroresPorCampo(form: HTMLFormElement, nuevos: Record<string, string | undefined>) {
    // El primero en el orden de la pantalla, no en el del esquema
    campoConError.current =
      Array.from(form.elements).find(
        (el): el is HTMLElement =>
          el instanceof HTMLElement && 'name' in el && Boolean(nuevos[el.name as string]),
      ) ?? null
    setErrores(nuevos as Errores<z.infer<S>>)
  }

  return { errores, errorGeneral, enviando, alertRef, handleSubmit }
}

function campoDelForm(form: HTMLFormElement, nombre: string) {
  return Array.from(form.elements).some((el) => 'name' in el && el.name === nombre)
}
