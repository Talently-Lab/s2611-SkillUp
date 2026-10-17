import { useEffect, useState } from 'react'
import { obtenerMisInscripciones, type Inscripcion } from '../lib/inscripciones'

type Estado = 'cargando' | 'error' | 'listo'

type Resultado = {
  estado: Estado
  inscripciones: Inscripcion[]
  // ApiError si falló la API; Error si la respuesta no tenía la forma esperada
  error: unknown
}

const CARGANDO: Resultado = { estado: 'cargando', inscripciones: [], error: null }

// Las inscripciones del alumno logueado. Un 401 lo resuelve el apiClient
// cerrando la sesión, y RutaProtegida manda a login.
export function useMisInscripciones() {
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  // Cambiarlo vuelve a correr el efecto
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerMisInscripciones(controlador.signal)
      .then((inscripciones) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', inscripciones, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'error', inscripciones: [], error })
      })
    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  return { ...resultado, reintentar }
}
