import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { datosDeCurso, registrarEvento, tipoDeError } from '../../lib/analytics'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../../lib/apiClient'
import { inscribirse, obtenerMisInscripciones } from '../../lib/inscripciones'
import Alert from '../ui/Alert'
import Button from '../ui/Button'

type EnrollButtonProps = {
  courseId: number
  // Los siguientes valores solo se usan para los eventos de GA4, por eso son "opcionales":
  slug?: string
  categoria?: string | null
}

// Botón de inscripción del detalle de curso (FE-14). Sin sesión manda a login;
// al admin no se le muestra.
function EnrollButton({ courseId, slug, categoria }: EnrollButtonProps) {
  const { usuario } = useAuth()
  const irALogin = useIrALogin()

  // GA4: sin sesión cuenta como intento y como error sin_sesion, antes de ir al login
  function inscribirSinSesion() {
    const curso = datosDeCurso({ id: courseId, slug, categoria })
    registrarEvento('attempt_enrollment', curso)
    registrarEvento('enrollment_error', { ...curso, error_type: 'sin_sesion' })
    irALogin()
  }

  if (!usuario) {
    return (
      // TODO: Texto provisorio, hay que confirmar con Marketing
      <Button size="lg" onClick={inscribirSinSesion}>
        Inscribirme
      </Button>
    )
  }

  if (usuario.rol === 'admin') return null

  // La key vuelve a montar el botón si cambia el usuario o el curso: el estado
  // arranca de cero y la consulta se repite sin arrastrar la anterior.
  return (
    <BotonAlumno
      key={`${usuario.id}-${courseId}`}
      courseId={courseId}
      slug={slug}
      categoria={categoria}
    />
  )
}

// Igual que RutaProtegida: login vuelve a esta página después de entrar
function useIrALogin() {
  const navigate = useNavigate()
  const location = useLocation()
  return () => navigate('/login', { state: { desde: location } })
}

type Estado = 'consultando' | 'disponible' | 'inscribiendo' | 'inscripto' | 'recienInscripto'

function BotonAlumno({ courseId, slug, categoria }: EnrollButtonProps) {
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
    // GA4: el intento va antes de la respuesta de la API
    const curso = datosDeCurso({ id: courseId, slug, categoria })
    registrarEvento('attempt_enrollment', curso)
    try {
      await inscribirse(courseId)
      registrarEvento('enrollment_success', curso)
      setEstado('recienInscripto')
    } catch (error) {
      registrarEvento('enrollment_error', {
        ...curso,
        error_type: tipoDeError(error, { 401: 'sesion_expirada', 409: 'ya_inscripto' }),
      })
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

  // TODO: Textos provisorios, hay que confirmar con Marketing
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

  // TODO: Textos provisorios, hay que confirmar con Marketing
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
      {/* TODO: Texto provisorio, hay que confirmar con Marketing */}
      <Button
        size="lg"
        onClick={inscribir}
        loading={estado === 'consultando' || estado === 'inscribiendo'}
      >
        Inscribirme
      </Button>
    </div>
  )
}

export default EnrollButton
