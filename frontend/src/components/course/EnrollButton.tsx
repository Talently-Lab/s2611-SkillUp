import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../../lib/apiClient'
import { inscribirse, obtenerMisInscripciones } from '../../lib/inscripciones'
import Alert from '../ui/Alert'
import Button from '../ui/Button'

type EnrollButtonProps = {
  courseId: number
}

// Botón de inscripción del detalle de curso (FE-14). Sin sesión manda a login;
// al admin no se le muestra.
function EnrollButton({ courseId }: EnrollButtonProps) {
  const { usuario } = useAuth()
  const irALogin = useIrALogin()

  if (!usuario) {
    return (
      // Texto provisorio: confirmar con Marketing
      <Button size="lg" onClick={irALogin}>
        Inscribirme
      </Button>
    )
  }

  if (usuario.rol === 'admin') return null

  // La key vuelve a montar el botón si cambia el usuario o el curso: el estado
  // arranca de cero y la consulta se repite sin arrastrar la anterior.
  return <BotonAlumno key={`${usuario.id}-${courseId}`} courseId={courseId} />
}

// Igual que RutaProtegida: login vuelve a esta página después de entrar
function useIrALogin() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => navigate('/login', { state: { desde: location } })
}

type Estado = 'consultando' | 'disponible' | 'inscribiendo' | 'inscripto' | 'recienInscripto'

function BotonAlumno({ courseId }: EnrollButtonProps) {
  const [estado, setEstado] = useState<Estado>('consultando')
  const [error, setError] = useState<string | null>(null)
  const irALogin = useIrALogin()
  // Dos clics seguidos pueden leer el estado viejo, antes del render. El ref
  // cambia en el acto y frena el segundo (igual que useAuthForm).
  const enviandoRef = useRef(false)
  // Solo se mueve el foco por algo que hizo el usuario, no al cargar la página
  const porClic = useRef(false)
  const avisoRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerMisInscripciones(controlador.signal)
      .then((inscripciones) => {
        const inscripto = inscripciones.some(
          (i) => i.curso.id === courseId && i.estado === 'activa',
        )
        setEstado(inscripto ? 'inscripto' : 'disponible')
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        // Si la consulta falla se habilita igual: al inscribirse, un 409 dice
        // si ya lo tenía. Un 401 ya cerró la sesión y EnrollButton pasa a
        // mostrar el botón de invitado.
        console.error('No se pudieron consultar las inscripciones:', error)
        setEstado('disponible')
      })
    return () => controlador.abort()
  }, [courseId])

  // El botón desaparece al inscribirse: el foco pasa al aviso, como el Alert
  // de los formularios, para que no quede perdido en el body.
  useEffect(() => {
    if (porClic.current && (error || estado === 'inscripto' || estado === 'recienInscripto')) {
      avisoRef.current?.focus()
    }
  }, [estado, error])

  async function inscribir() {
    if (enviandoRef.current) return
    enviandoRef.current = true
    porClic.current = true
    setError(null)
    setEstado('inscribiendo')
    try {
      await inscribirse(courseId)
      setEstado('recienInscripto')
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setEstado('inscripto')
        return
      }
      if (error instanceof ApiError && error.status === 401) {
        // El apiClient ya cerró la sesión como expirada: login muestra el aviso
        irALogin()
        return
      }
      setEstado('disponible')
      setError(
        error instanceof ApiError && error.status === 0 ? MENSAJE_SIN_CONEXION : MENSAJE_GENERICO,
      )
    } finally {
      enviandoRef.current = false
    }
  }

  // Textos provisorios: confirmar con Marketing
  if (estado === 'recienInscripto') {
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert variant="success" ref={avisoRef}>
          ¡Listo! Ya tenés este curso en Mis cursos.
        </Alert>
        <Button variant="secondary" to="/mis-cursos">
          Ir a mis cursos
        </Button>
      </div>
    )
  }

  // Textos provisorios: confirmar con Marketing
  if (estado === 'inscripto') {
    return (
      <div className="flex flex-col items-start gap-3">
        <div
          ref={avisoRef}
          tabIndex={-1}
          className="rounded-lg font-semibold focus:outline-2 focus:outline-offset-2 focus:outline-ink"
        >
          Ya tenés este curso
        </div>
        <Button variant="secondary" to="/mis-cursos">
          Ir a mis cursos
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-3">
      {error && <Alert ref={avisoRef}>{error}</Alert>}
      {/* Texto provisorio: confirmar con Marketing */}
      <Button
        size="lg"
        onClick={inscribir}
        loading={estado === 'inscribiendo'}
        disabled={estado === 'consultando'}
      >
        Inscribirme
      </Button>
    </div>
  )
}

export default EnrollButton
