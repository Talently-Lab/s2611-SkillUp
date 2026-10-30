import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import CatalogCardFooter from '../components/course/CatalogCardFooter'
import CourseCard from '../components/course/CourseCard'
import CourseCardSkeleton from '../components/course/CourseCardSkeleton'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { useAuth } from '../hooks/useAuth'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import { obtenerCursos, type Course } from '../lib/courses'
import { rutaInicioPorRol } from '../lib/sesion'

const CANTIDAD_DESTACADOS = 3

const gridClasses = 'grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6'

// En celular los botones van apilados y a lo ancho
const botonesClasses = 'flex flex-col gap-3 sm:flex-row'

const BENEFICIOS = ['Aprendés haciendo', 'A tu ritmo', 'Desde cualquier lugar']

// Texto provisorio: confirmar con Marketing
const PASOS = [
  {
    titulo: 'Explorá el catálogo',
    texto: 'Elegí entre los cursos el que más te guste.',
  },
  {
    titulo: 'Inscribite',
    texto: 'Hacé clic en "Inscribirme" y el curso queda en Mis cursos.',
  },
  {
    titulo: 'Aprendé haciendo',
    texto: 'Avanzá a tu ritmo con proyectos reales para tu portfolio.',
  },
]

type Resultado =
  | { estado: 'cargando'; cursos: Course[]; error: null }
  | { estado: 'listo'; cursos: Course[]; error: null }
  | { estado: 'error'; cursos: Course[]; error: unknown }

const CARGANDO: Resultado = { estado: 'cargando', cursos: [], error: null }

// Igual que en Catalog.tsx
function renderCourseCard(course: Course) {
  return (
    <CourseCard
      key={course.slug}
      titulo={course.titulo}
      url_portada={course.url_portada}
      categoria={course.categoria ?? undefined}
      nivel={course.nivel}
      resumen={course.resumen}
      instructor={course.instructor}
      footer={
        <CatalogCardFooter
          slug={course.slug}
          cantidad_clases={course.cantidad_clases}
          duracion_semanas={course.duracion_semanas}
        />
      }
    />
  )
}

// Sin sesión lleva al registro; con sesión, al panel de su rol
function BotonEmpezar() {
  const { usuario } = useAuth()

  return (
    <Button
      to={usuario ? rutaInicioPorRol(usuario.rol) : '/registro'}
      size="lg"
      className="w-full sm:w-auto"
    >
      Empezar a crear
    </Button>
  )
}

function IconoCheck() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="size-4"
    >
      <path d="m5 12 5 5 9-10" />
    </svg>
  )
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-cream/60 px-6 py-12 sm:px-10 lg:py-16">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -right-16 -z-10 size-72 rounded-full bg-primary/25 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-28 -left-20 -z-10 size-72 rounded-full bg-primary-soft/30 blur-3xl"
      />

      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div className="max-w-2xl">
          <h1 className="text-4xl leading-tight font-extrabold tracking-tight text-balance lg:text-[3.25rem]">
            Construí tu primer proyecto IT y{' '}
            <span className="underline decoration-primary decoration-wavy decoration-2 underline-offset-8">
              transformá tu carrera
            </span>
            .
          </h1>
          <p className="mt-6 text-lg text-pretty text-ink/70">
            Sabemos que empezar a estudiar algo nuevo puede abrumar. Por eso diseñamos un espacio
            donde vas a aprender haciendo, a tu ritmo y sin frustraciones. Tu próxima etapa empieza
            acá, y te acompañamos en el proceso.
          </p>
          <div className={`mt-8 ${botonesClasses}`}>
            <BotonEmpezar />
            <Button to="/cursos" variant="secondary" size="lg" className="w-full sm:w-auto">
              Explorar el catálogo
            </Button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="squircle hidden w-72 rotate-2 rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm lg:block"
        >
          <ul className="flex flex-col gap-4">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-center gap-3 font-display font-semibold">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-ink">
                  <IconoCheck />
                </span>
                {beneficio}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function CursosDestacados() {
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  const [intento, setIntento] = useState(0)

  useEffect(() => {
    const controlador = new AbortController()
    obtenerCursos(controlador.signal)
      .then((cursos) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', cursos: cursos.slice(0, CANTIDAD_DESTACADOS), error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'error', cursos: [], error })
      })
    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  const { estado, cursos, error } = resultado
  if (estado === 'listo' && cursos.length === 0) return null

  return (
    <section aria-labelledby="destacados-titulo" className="mt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
        <h2 id="destacados-titulo" className="text-2xl font-bold sm:text-3xl">
          Cursos destacados
        </h2>
        <Link
          to="/cursos"
          className="rounded-md font-semibold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Ver todos los cursos
        </Link>
      </div>

      {estado === 'cargando' && (
        <>
          <p role="status" className="sr-only">
            Cargando cursos destacados
          </p>
          <div className={gridClasses}>
            {Array.from({ length: CANTIDAD_DESTACADOS }, (_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        </>
      )}

      {estado === 'error' && (
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
      )}

      {estado === 'listo' && <div className={gridClasses}>{cursos.map(renderCourseCard)}</div>}
    </section>
  )
}

function ComoFunciona() {
  return (
    <section aria-labelledby="como-funciona-titulo" className="mt-16">
      <h2 id="como-funciona-titulo" className="text-2xl font-bold sm:text-3xl">
        ¿Cómo funciona?
      </h2>
      {/* Texto provisorio: confirmar con Marketing */}
      <ol className="mt-6 grid gap-6 md:grid-cols-3">
        {PASOS.map((paso, i) => (
          <li
            key={paso.titulo}
            className="squircle rounded-2xl border border-ink/10 bg-surface p-6 shadow-sm"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-ink">
              {i + 1}
            </span>
            <h3 className="mt-4 text-lg font-semibold">{paso.titulo}</h3>
            <p className="mt-1 text-ink/70">{paso.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Cierre() {
  return (
    <section className="mt-16 rounded-3xl bg-cream px-6 py-12 text-center sm:px-10">
      <h2 className="text-2xl font-bold text-balance sm:text-3xl">Tu próxima etapa empieza acá</h2>
      <div className={`mt-6 justify-center ${botonesClasses}`}>
        <BotonEmpezar />
      </div>
    </section>
  )
}

function Home() {
  useTitulo('Inicio')

  return (
    <>
      <Hero />
      <CursosDestacados />
      <ComoFunciona />
      <Cierre />
    </>
  )
}

export default Home
