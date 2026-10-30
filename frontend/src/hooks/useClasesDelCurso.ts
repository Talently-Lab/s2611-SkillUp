import { useEffect, useState } from 'react'
import { obtenerClasesDelCurso, type Clase } from '../lib/misCursos'

type Estado = 'cargando' | 'error' | 'listo'

type Resultado = {
  estado: Estado
  clases: Clase[]
  // ApiError si falló la API; Error si la respuesta no tenía la forma esperada
  error: unknown
}

const CARGANDO: Resultado = { estado: 'cargando', clases: [], error: null }

// Las clases de un curso en el que el alumno está inscripto. Con slug null no
// pide nada: así se espera a saber si está inscripto antes de llamar.
export function useClasesDelCurso(slug: string | null) {
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  // Cambiarlo vuelve a correr el efecto
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    if (!slug) return
    const controlador = new AbortController()
    obtenerClasesDelCurso(slug, controlador.signal)
      .then((clases) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', clases, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'error', clases: [], error })
      })
    return () => controlador.abort()
  }, [slug, intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  // Después de un POST /api/progreso que salió bien, sin volver a pedir la lista
  function marcarCompletada(idClase: number) {
    setResultado((r) => ({
      ...r,
      clases: r.clases.map((c) => (c.id === idClase ? { ...c, completada: true } : c)),
    }))
  }

  return { ...resultado, reintentar, marcarCompletada }
}
