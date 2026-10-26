import { useEffect, useState } from 'react'
import CatalogCardFooter from '../components/course/CatalogCardFooter'
import CourseCard from '../components/course/CourseCard'
import CourseGrid from '../components/course/CourseGrid'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import { datosDeCurso, registrarEvento, registrarVistaUnaVez } from '../lib/analytics'
import { obtenerCursos, type Course } from '../lib/courses'

type Resultado =
  | { estado: 'cargando'; cursos: Course[]; error: null }
  | { estado: 'listo'; cursos: Course[]; error: null }
  | { estado: 'error'; cursos: Course[]; error: unknown }

const CARGANDO: Resultado = { estado: 'cargando', cursos: [], error: null }

// position es el lugar de la tarjeta en la grilla, contando desde 1
// ocuparemos esto para capturar la posición de la tarjeta en el evento click_course_detail,
//  según la matriz de Data definida en semanas anteriores.
function renderCourseCard(course: Course, indice: number) {
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
          onVerMas={() =>
            registrarEvento('click_course_detail', {
              ...datosDeCurso(course),
              level: course.nivel,
              position: indice + 1,
            })
          }
        />
      }
    />
  )
}

function Catalog() {
  useTitulo('Catálogo')
  const [resultado, setResultado] = useState<Resultado>(CARGANDO)
  const [intento, setIntento] = useState(0)

  // GA4: una vez por visita al catálogo
  useEffect(() => {
    registrarVistaUnaVez('view_course_list')
  }, [])

  useEffect(() => {
    const controlador = new AbortController()
    obtenerCursos(controlador.signal)
      .then((cursos) => {
        if (controlador.signal.aborted) return
        setResultado({ estado: 'listo', cursos, error: null })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        console.error('No se pudo cargar el catálogo:', error)
        setResultado({ estado: 'error', cursos: [], error })
      })
    return () => controlador.abort()
  }, [intento])

  function reintentar() {
    setResultado(CARGANDO)
    setIntento((n) => n + 1)
  }

  const { estado, cursos, error } = resultado
  const titulo =
    estado === 'listo'
      ? `${cursos.length} ${cursos.length === 1 ? 'curso disponible' : 'cursos disponibles'}`
      : 'Cursos disponibles'

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold tracking-wider text-ink/70 uppercase">
            Explorá la oferta académica
          </p>
          <h1 className="mt-1 text-3xl font-bold">{titulo}</h1>
        </div>
        <p className="text-sm text-ink/70">
          Contenidos actualizados con proyectos para tu portfolio
        </p>
      </header>

      {estado === 'error' ? (
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
      ) : (
        <CourseGrid
          isLoading={estado === 'cargando'}
          isEmpty={estado === 'listo' && cursos.length === 0}
        >
          {cursos.map(renderCourseCard)}
        </CourseGrid>
      )}
    </>
  )
}

export default Catalog