import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CoverFallback from '../components/course/CoverFallback'
import EnrollButton from '../components/course/EnrollButton'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import { nivelLabel, obtenerCurso, type Course } from '../lib/courses'

type Resultado =
  | { estado: 'cargando'; curso: null; error: null }
  | { estado: 'listo'; curso: Course; error: null }
  | { estado: 'noEncontrado'; curso: null; error: null }
  | { estado: 'error'; curso: null; error: unknown }

const CARGANDO: Resultado = { estado: 'cargando', curso: null, error: null }

function initials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase()
}

function CourseDetail() {
  const { slug = '' } = useParams()
  return <ContenidoDetalle key={slug} slug={slug} />
}

function ContenidoDetalle({ slug }: { slug: string }) {
  const [resultado, setResultado] = useState<Resultado>(() =>
    slug ? CARGANDO : { estado: 'noEncontrado', curso: null, error: null },
  )
  const [intento, setIntento] = useState(0)

  useTitulo(
    resultado.estado === 'listo'
      ? resultado.curso.titulo
      : resultado.estado === 'noEncontrado'
        ? 'Curso no encontrado'
        : 'Detalle del curso',
  )

  useEffect(() => {
    if (!slug) return

    const controlador = new AbortController()
    obtenerCurso(slug, controlador.signal)
      .then((curso) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', curso, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        if (error instanceof ApiError && error.status === 404) {
          setResultado({ estado: 'noEncontrado', curso: null, error: null })
          return
        }
        setResultado({ estado: 'error', curso: null, error })
      })
    return () => controlador.abort()
  }, [slug, intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  const volver = (
    <Link
      to="/cursos"
      className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink"
    >
      <span aria-hidden="true">←</span> Volver al catálogo
    </Link>
  )

  if (resultado.estado === 'cargando') {
    return (
      <>
        {volver}
        <p role="status" className="sr-only">
          Cargando detalle del curso
        </p>
        <DetalleSkeleton />
      </>
    )
  }

  if (resultado.estado === 'noEncontrado') {
    return (
      <>
        {volver}
        <div className="max-w-xl rounded-2xl border border-dashed border-ink/20 bg-cream/50 p-8">
          <h1 className="text-2xl font-bold">No encontramos este curso</h1>
          <p className="mt-2 text-ink/70">
            Puede que el enlace haya cambiado o que el curso ya no esté disponible.
          </p>
          <Button to="/cursos" variant="secondary" className="mt-6">
            Explorar el catálogo
          </Button>
        </div>
      </>
    )
  }

  if (resultado.estado === 'error') {
    return (
      <>
        {volver}
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Alert>
            {resultado.error instanceof ApiError && resultado.error.status === 0
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

  const { curso } = resultado
  const clasesOrdenadas = curso.clases
    ? [...curso.clases].sort((a, b) => a.orden - b.orden)
    : []

  return (
    <>
      {volver}

      <section className="grid grid-cols-1 gap-8 rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm lg:grid-cols-12 lg:items-center lg:p-8">
        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="flex flex-wrap items-center gap-2">
            {curso.categoria && <Badge tone="brand">{curso.categoria}</Badge>}
            {curso.nivel && (
              <Badge>Nivel: {nivelLabel[curso.nivel] ?? curso.nivel}</Badge>
            )}
          </div>

          <h1 className="text-3xl leading-tight font-bold sm:text-4xl">{curso.titulo}</h1>

          {curso.resumen && <p className="text-base text-ink/80">{curso.resumen}</p>}

          <dl className="mt-2 flex flex-wrap gap-6 border-y border-ink/10 py-4">
            <div>
              <dt className="text-xs font-semibold tracking-wider text-ink/60 uppercase">
                Contenido
              </dt>
              <dd className="mt-0.5 text-sm font-semibold">
                {curso.cantidad_clases} {curso.cantidad_clases === 1 ? 'clase' : 'clases'}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold tracking-wider text-ink/60 uppercase">
                Duración
              </dt>
              <dd className="mt-0.5 text-sm font-semibold">
                {curso.duracion_semanas ? `${curso.duracion_semanas} semanas` : 'A tu ritmo'}
              </dd>
            </div>
            {curso.instructor && (
              <div>
                <dt className="text-xs font-semibold tracking-wider text-ink/60 uppercase">
                  Docente
                </dt>
                <dd className="mt-0.5 text-sm font-semibold">{curso.instructor.nombre}</dd>
              </div>
            )}
          </dl>

          <div className="mt-2">
            <EnrollButton courseId={curso.id} />
          </div>
        </div>

        <div className="aspect-video overflow-hidden rounded-xl lg:col-span-5">
          {curso.url_portada ? (
            <img src={curso.url_portada} alt="" className="size-full object-cover" />
          ) : (
            <CoverFallback />
          )}
        </div>
      </section>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="flex flex-col gap-8 lg:col-span-8">
          <section aria-labelledby="acerca-titulo">
            <h2 id="acerca-titulo" className="text-2xl font-bold">
              Acerca del curso
            </h2>
            <p className="mt-3 leading-relaxed text-ink/80">
              {curso.descripcion ?? curso.resumen}
            </p>
          </section>

          {clasesOrdenadas.length > 0 && (
            <section aria-labelledby="temario-titulo">
              <div className="mb-4 flex items-baseline justify-between gap-4">
                <h2 id="temario-titulo" className="text-2xl font-bold">
                  Temario del curso
                </h2>
                <span className="text-sm text-ink/70">
                  {curso.cantidad_clases} {curso.cantidad_clases === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              <ol className="flex flex-col gap-3">
                {clasesOrdenadas.map((clase) => (
                  <li
                    key={clase.id}
                    className="flex items-center gap-4 rounded-xl border border-ink/10 bg-surface px-4 py-3"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-cream text-sm font-semibold tabular-nums">
                      {clase.orden}
                    </span>
                    <span className="font-medium">{clase.titulo}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}
        </div>

        {curso.instructor && (
          <aside aria-labelledby="docente-titulo" className="lg:col-span-4">
            <div className="rounded-2xl border border-ink/10 bg-cream/60 p-6">
              <h2
                id="docente-titulo"
                className="text-xs font-semibold tracking-wider text-ink/70 uppercase"
              >
                Quién dicta el curso
              </h2>
              <div className="mt-4 flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-base font-semibold text-ink"
                >
                  {initials(curso.instructor.nombre)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold">{curso.instructor.nombre}</p>
                  {curso.instructor.cargo && (
                    <p className="truncate text-sm text-ink/70">{curso.instructor.cargo}</p>
                  )}
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </>
  )
}

function DetalleSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-1 gap-8 rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm lg:grid-cols-12 lg:items-center lg:p-8"
    >
      <div className="flex flex-col gap-4 animate-pulse motion-reduce:animate-none lg:col-span-7">
        <div className="flex gap-2">
          <div className="h-6 w-24 rounded-full bg-cream" />
          <div className="h-6 w-32 rounded-full bg-cream" />
        </div>
        <div className="h-9 w-4/5 rounded bg-cream" />
        <div className="h-4 w-full rounded bg-cream" />
        <div className="h-4 w-2/3 rounded bg-cream" />
        <div className="mt-4 h-12 w-40 rounded-xl bg-cream" />
      </div>
      <div className="aspect-video animate-pulse rounded-xl bg-cream motion-reduce:animate-none lg:col-span-5" />
    </div>
  )
}

export default CourseDetail

