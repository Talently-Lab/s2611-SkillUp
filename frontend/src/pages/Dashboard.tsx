import { useState } from 'react'
import CourseCardSkeleton from '../components/course/CourseCardSkeleton'
import CoverFallback from '../components/course/CoverFallback'
import EnrolledCourseCard from '../components/course/EnrolledCourseCard'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ProgressBar from '../components/ui/ProgressBar'
import { useAuth } from '../hooks/useAuth'
import { useMisInscripciones } from '../hooks/useMisInscripciones'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import type { Inscripcion } from '../lib/inscripciones'
import { estadoCurso, porcentaje, type EstadoCurso } from '../lib/progreso'

// Dashboard del alumno (FE-15), según "Panel de Usuario" de Stitch pero solo
// con lo que tiene datos: sin desafíos, promedio, sugeridos ni constancias.

type Filtro = 'todos' | EstadoCurso

const FILTROS: { valor: Filtro; label: string }[] = [
  { valor: 'todos', label: 'Todos' },
  { valor: 'en_progreso', label: 'En progreso' },
  { valor: 'completado', label: 'Completados' },
]

const gridClasses = 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'

function Dashboard() {
  useTitulo('Mis cursos')
  const { usuario } = useAuth()
  const { estado, inscripciones, error, reintentar } = useMisInscripciones()
  const [filtro, setFiltro] = useState<Filtro>('todos')

  // Las canceladas no se muestran ni cuentan
  const activas = inscripciones.filter((i) => i.estado === 'activa')
  const visibles = filtro === 'todos' ? activas : activas.filter((i) => estadoCurso(i) === filtro)
  const continuar = masReciente(activas.filter((i) => estadoCurso(i) === 'en_progreso'))

  const encabezado = (
    <Encabezado
      nombre={usuario?.nombre?.trim()}
      resumen={
        estado === 'listo'
          ? {
              cursos: activas.length,
              clases: activas.reduce((suma, i) => suma + i.clases_completadas, 0),
            }
          : undefined
      }
    />
  )

  if (estado === 'cargando') {
    return (
      <>
        {encabezado}
        <p role="status" className="sr-only">
          Cargando tus cursos
        </p>
        <div className={gridClasses}>
          {Array.from({ length: 3 }, (_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </>
    )
  }

  if (estado === 'error') {
    return (
      <>
        {encabezado}
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Alert>
            {error instanceof ApiError && error.status === 0
              ? MENSAJE_SIN_CONEXION
              : MENSAJE_GENERICO}
          </Alert>
          <Button variant="secondary" onClick={reintentar}>
            Reintentar
          </Button>
        </div>
      </>
    )
  }

  if (activas.length === 0) {
    return (
      <>
        {encabezado}
        {/* Texto provisorio: confirmar con Marketing */}
        <p className="mb-6 text-ink/70">Todavía no te inscribiste en ningún curso.</p>
        <div className={gridClasses}>
          <SumarCursoCard />
        </div>
      </>
    )
  }

  return (
    <>
      {encabezado}

      {continuar && <ContinuarCurso inscripcion={continuar} />}

      <section aria-labelledby="mis-cursos-titulo">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 id="mis-cursos-titulo" className="text-2xl font-bold">
            Mis cursos registrados ({activas.length})
          </h2>
          <div role="group" aria-label="Filtrar cursos" className="flex flex-wrap gap-2">
            {FILTROS.map(({ valor, label }) => (
              <Button
                key={valor}
                size="sm"
                variant={filtro === valor ? 'primary' : 'secondary'}
                aria-pressed={filtro === valor}
                onClick={() => setFiltro(valor)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {visibles.length === 0 && (
          <p className="mb-6 text-ink/70">No tenés cursos en esta categoría todavía.</p>
        )}

        <div className={gridClasses}>
          {visibles.map((inscripcion) => (
            <EnrolledCourseCard key={inscripcion.id_inscripcion} inscripcion={inscripcion} />
          ))}
          <SumarCursoCard />
        </div>
      </section>
    </>
  )
}

// La inscripción más reciente, o null si no hay ninguna
function masReciente(inscripciones: Inscripcion[]) {
  return inscripciones.reduce<Inscripcion | null>(
    (reciente, i) =>
      !reciente || Date.parse(i.fecha_inscripcion) > Date.parse(reciente.fecha_inscripcion)
        ? i
        : reciente,
    null,
  )
}

type EncabezadoProps = {
  nombre?: string
  // Sin datos (cargando o error) no se muestran los números
  resumen?: { cursos: number; clases: number }
}

function Encabezado({ nombre, resumen }: EncabezadoProps) {
  return (
    <header className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <Badge tone="success">Campus virtual activo</Badge>
        <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
          {nombre ? `¡Hola, ${nombre}!` : '¡Hola!'} <span aria-hidden="true">👋</span>
        </h1>
        {/* Texto provisorio: confirmar con Marketing */}
        <p className="mt-2 text-ink/70">Qué bueno verte de nuevo. Seguí aprendiendo a tu ritmo.</p>
      </div>

      {resumen && (
        <dl className="grid grid-cols-2 gap-4 lg:w-80">
          <Numero label="Cursos" valor={resumen.cursos} />
          <Numero label="Clases completadas" valor={resumen.clases} />
        </dl>
      )}
    </header>
  )
}

function Numero({ label, valor }: { label: string; valor: number }) {
  return (
    <div className="flex flex-col rounded-2xl border border-ink/10 bg-cream/60 p-4">
      <dt className="text-sm text-ink/70">{label}</dt>
      <dd className="order-first font-display text-3xl font-bold tabular-nums">{valor}</dd>
    </div>
  )
}

function ContinuarCurso({ inscripcion }: { inscripcion: Inscripcion }) {
  const { curso, clases_completadas } = inscripcion
  const avance = porcentaje(clases_completadas, curso.cantidad_clases)

  return (
    <section aria-labelledby="continuar-titulo" className="mb-12">
      <h2 id="continuar-titulo" className="mb-4 text-2xl font-bold">
        Continuar donde dejaste
      </h2>
      <article className="flex flex-col gap-6 rounded-2xl border border-ink/10 bg-surface p-4 shadow-sm md:flex-row md:items-center md:p-6">
        <div className="aspect-video shrink-0 overflow-hidden rounded-xl md:w-2/5">
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
          <h3 className="text-2xl leading-snug font-bold">{curso.titulo}</h3>
          <ProgressBar valor={avance} label={`Progreso de ${curso.titulo}`} />
          <Button to={`/mis-cursos/${curso.slug}`} size="lg" className="mt-2 self-start">
            Continuar cursada
          </Button>
        </div>
      </article>
    </section>
  )
}

function SumarCursoCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-ink/20 bg-cream/50 p-6 text-center">
      {/* p y no h3: en el estado vacío no hay h2 y se saltaría un nivel. font-display
          porque los h3 lo toman de index.css */}
      <p className="font-display text-lg font-bold">Sumar nuevo curso a tu plan</p>
      <Button to="/cursos" variant="secondary">
        Ir al catálogo de cursos
      </Button>
    </div>
  )
}

export default Dashboard
