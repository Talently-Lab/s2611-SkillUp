import { useEffect, useState } from 'react'
import type { Course } from '../lib/courses'
import { obtenerCursosAdmin } from '../lib/cursosAdmin'

type Estado = 'cargando' | 'error' | 'listo'

type Resultado = {
  estado: Estado
  cursos: Course[]
  error: unknown // da ApiError si falló la API, Error si la respuesta vino con otra forma
}

const CARGANDO: Resultado = { estado: 'cargando', cursos: [], error: null }

// Usammos el mismo patrón que useUsuarios para la tabla de cursos del panel admin.
// Si llega un 401, el apiClient cierra la sesión.
export function useCursosAdmin() {
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  const [intento, setIntento] = useState(0) // Al presionar "reintentar" se vuelve a pedir la lista.

  useEffect(() => {
    const controlador = new AbortController()
    obtenerCursosAdmin(controlador.signal)
      .then((cursos) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', cursos, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        // En pantalla va el mensaje genérico, el detalle queda en la consola!
        console.error('No se pudieron cargar los cursos del panel admin:', error)
        setResultado({ estado: 'error', cursos: [], error })
      })
    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

// Saca el curso de la tabla después de eliminarlo, sin volver a pedir la lista
  function quitarCurso(id: number) {
    setResultado((actual) => ({ ...actual, cursos: actual.cursos.filter((c) => c.id !== id) }))
  }

  return { ...resultado, reintentar, quitarCurso }
}
