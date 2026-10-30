import { useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CoverFallback from '../components/course/CoverFallback'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import Spinner from '../components/ui/Spinner'
import { useClasesDelCurso } from '../hooks/useClasesDelCurso'
import { useMisInscripciones } from '../hooks/useMisInscripciones'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import type { Inscripcion } from '../lib/inscripciones'
import { marcarClaseVista, type Clase } from '../lib/misCursos'
import { porcentaje } from '../lib/progreso'

// Curso inscripto: el panel del alumno para acceder a sus clases. Sin video,
// según el alcance del MVP.

function mensajeDeError(error: unknown) {
  return error instanceof ApiError && error.status === 0 ? MENSAJE_SIN_CONEXION : MENSAJE_GENERICO
}

// Con key: al pasar de un curso a otro arranca de cero, sin mostrar las clases
// del anterior
function EnrolledCourse() {
  const { slug = '' } = useParams()
  return <CursoInscripto key={slug} slug={slug} />
}

function CursoInscripto({ slug }: { slug: string }) {
  const { estado, inscripciones, error, reintentar } = useMisInscripciones()
  // Las canceladas cuentan como no inscripto, igual que en el panel
  const inscripcion = inscripciones.find((i) => i.estado === 'activa' && i.curso.slug === slug)
  useTitulo(inscripcion?.curso.titulo ?? 'Mi curso')

  const clases = useClasesDelCurso(inscripcion ? slug : null)
  // Clases marcadas como vistas en esta visita: se suman a las de la inscripción
  // para mover la barra sin volver a pedir GET /api/enrollments/me
  const [vistasAhora, setVistasAhora] = useState(0)

  function alVerClase(idClase: number) {
    clases.marcarCompletada(idClase)
    setVistasAhora((n) => n + 1)
  }

  let contenido
  if (estado === 'cargando') {
    contenido = (
      // Texto provisorio: confirmar con Marketing
      <p role="status" className="flex items-center gap-2 text-ink/70">
        <Spinner />
        Cargando tu curso
      </p>
    )
  } else if (estado === 'error') {
    contenido = (
      <div className="flex max-w-xl flex-col items-start gap-4">
        <Alert>{mensajeDeError(error)}</Alert>
        <Button variant="secondary" onClick={reintentar}>
          Reintentar
        </Button>
      </div>
    )
  } else if (!inscripcion) {
    contenido = <NoInscripto slug={slug} />
  } else {
    contenido = (
      <>
        <Encabezado
          inscripcion={inscripcion}
          completadas={inscripcion.clases_completadas + vistasAhora}
        />
        <section aria-labelledby="clases-titulo">
          <h2 id="clases-titulo" className="mb-4 text-2xl font-bold">
            Clases
          </h2>
          <ListaDeClases {...clases} onVista={alVerClase} />
        </section>
      </>
    )
  }

  return (
    <>
      {/* Texto provisorio: confirmar con Marketing */}
      <Link
        to="/mis-cursos"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink"
      >
        <span aria-hidden="true">←</span> Volver a Mis cursos
      </Link>
      {contenido}
    </>
  )
}

function NoInscripto({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-ink/10 bg-cream/50 px-6 py-12 text-center">
      {/* Texto provisorio: confirmar con Marketing */}
      <h1 className="text-2xl font-bold">Todavía no estás inscripto en este curso.</h1>
      <Button to={`/cursos/${slug}`} size="lg" className="mt-6">
        Ver el curso
      </Button>
    </div>
  )
}

type EncabezadoProps = {
  inscripcion: Inscripcion
  // Las de la inscripción más las marcadas en esta visita
  completadas: number
}

function Encabezado({ inscripcion, completadas }: EncabezadoProps) {
  const { curso } = inscripcion
  const vistas = Math.min(completadas, curso.cantidad_clases)
  const avance = porcentaje(vistas, curso.cantidad_clases)

  return (
    <header className="mb-10 flex flex-col gap-6 md:flex-row md:items-center">
      <div className="aspect-video shrink-0 overflow-hidden rounded-2xl md:w-2/5">
        {curso.url_portada ? (
          <img src={curso.url_portada} alt="" className="size-full object-cover" />
        ) : (
          <CoverFallback />
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        {curso.categoria && (
          <p className="text-xs font-semibold tracking-wider text-ink/70 uppercase">
            {curso.categoria}
          </p>
        )}
        <h1 className="text-3xl leading-tight font-bold break-words sm:text-4xl">{curso.titulo}</h1>
        <ProgressBar valor={avance} label={`Progreso de ${curso.titulo}`} />
        {/* Texto provisorio: confirmar con Marketing */}
        {curso.cantidad_clases > 0 && (
          <p className="text-sm text-ink/70">
            {vistas} de {curso.cantidad_clases} clases vistas
          </p>
        )}
      </div>
    </header>
  )
}

type ListaDeClasesProps = ReturnType<typeof useClasesDelCurso> & {
  onVista: (idClase: number) => void
}

function ListaDeClases({ estado, clases, error, reintentar, onVista }: ListaDeClasesProps) {
  if (estado === 'cargando') {
    return (
      // Texto provisorio: confirmar con Marketing
      <p role="status" className="flex items-center gap-2 text-ink/70">
        <Spinner />
        Cargando clases
      </p>
    )
  }

  if (estado === 'error') {
    return (
      <div className="flex max-w-xl flex-col items-start gap-4">
        <Alert>{mensajeDeError(error)}</Alert>
        <Button variant="secondary" onClick={reintentar}>
          Reintentar
        </Button>
      </div>
    )
  }

  if (clases.length === 0) {
    return (
      // Texto provisorio: confirmar con Marketing
      <p className="rounded-2xl border border-ink/10 bg-cream/50 px-6 py-8 text-center text-ink/70">
        Las clases de este curso todavía no están cargadas.
      </p>
    )
  }

  return (
    <ol className="flex flex-col gap-3">
      {clases.map((clase, i) => (
        <ClaseItem key={clase.id} numero={i + 1} clase={clase} onVista={onVista} />
      ))}
    </ol>
  )
}

type ClaseItemProps = {
  numero: number
  clase: Clase
  onVista: (idClase: number) => void
}

function ClaseItem({ numero, clase, onVista }: ClaseItemProps) {
  const [marcando, setMarcando] = useState(false)
  const [error, setError] = useState<unknown>(null)
  // El estado tarda un render en deshabilitar el botón: con esto un doble clic
  // no llega a mandar dos pedidos
  const enCurso = useRef(false)
  const resumenRef = useRef<HTMLElement>(null)

  async function marcar() {
    if (enCurso.current) return
    enCurso.current = true
    setMarcando(true)
    setError(null)
    try {
      await marcarClaseVista(clase.id)
      onVista(clase.id)
      // El botón desaparece: el foco pasa al título, que ahora dice "Completada"
      resumenRef.current?.focus()
    } catch (e) {
      setError(e)
    } finally {
      enCurso.current = false
      setMarcando(false)
    }
  }

  return (
    <li>
      <details className="group rounded-2xl border border-ink/10 bg-surface shadow-sm">
        <summary
          ref={resumenRef}
          className="flex cursor-pointer list-none items-center gap-3 rounded-2xl p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink [&::-webkit-details-marker]:hidden"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream font-display text-sm font-bold tabular-nums">
            {numero}
          </span>
          <span className="min-w-0 flex-1 font-semibold break-words">{clase.titulo}</span>
          {clase.completada && (
            <span className="flex shrink-0 text-success">
              <IconoCheck />
              {/* Texto provisorio: confirmar con Marketing */}
              <span className="sr-only">Completada</span>
            </span>
          )}
          <IconoChevron />
        </summary>

        <div className="flex flex-col items-start gap-4 border-t border-ink/10 p-4">
          {clase.descripcion && <p className="text-ink/70">{clase.descripcion}</p>}
          {clase.contenidoTexto && (
            <p className="whitespace-pre-line break-words">{clase.contenidoTexto}</p>
          )}
          {clase.urlExterna && (
            // Texto provisorio: confirmar con Marketing
            <a
              href={clase.urlExterna}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 font-semibold underline underline-offset-4 hover:no-underline"
            >
              Abrir material
              <span className="sr-only"> (se abre en una pestaña nueva)</span>
              <IconoExterno />
            </a>
          )}
          {error !== null && <Alert className="self-stretch">{mensajeDeError(error)}</Alert>}
          {!clase.completada && (
            // Texto provisorio: confirmar con Marketing
            <Button onClick={marcar} loading={marcando}>
              Marcar como vista
            </Button>
          )}
        </div>
      </details>
    </li>
  )
}

function IconoCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-6"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12 3 3 5-6" />
    </svg>
  )
}

function IconoChevron() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-5 shrink-0 text-ink/70 transition-transform group-open:rotate-180 motion-reduce:transition-none"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function IconoExterno() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="size-4"
    >
      <path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </svg>
  )
}

export default EnrolledCourse
