import { useEffect, useState } from 'react'
import { obtenerUsuarios, type Usuario } from '../lib/usuarios'

type Estado = 'cargando' | 'error' | 'listo'

type Resultado = {
  estado: Estado
  usuarios: Usuario[]
  // ApiError si falló la API; Error si la respuesta no tenía la forma esperada
  error: unknown
}

const CARGANDO: Resultado = { estado: 'cargando', usuarios: [], error: null }

// Los usuarios registrados, para el panel de admin. Un 401 lo resuelve el
// apiClient cerrando la sesión, y RutaProtegida manda a login.
export function useUsuarios() {
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  // Cambiarlo vuelve a correr el efecto
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerUsuarios(controlador.signal)
      .then((usuarios) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', usuarios, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'error', usuarios: [], error })
      })
    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  return { ...resultado, reintentar }
}
