import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CatalogCardFooter from '../components/course/CatalogCardFooter'
import CourseCard from '../components/course/CourseCard'
import CourseFilters, { type Filtros } from '../components/course/CourseFilters'
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

// saco tildes y mayúsculas para que "diseno" encuentre "Diseño"
function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

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

  // los filtros viven en la URL para poder compartirlos por link
  const [params, setParams] = useSearchParams()
  const filtros: Filtros = {
    query: params.get('query') ?? '',
    categoria: params.get('categoria') ?? '',
    nivel: params.get('nivel') ?? '',
  }

  const cambiarFiltros = useCallback(
    (cambios: Partial<Filtros>) => {
      setParams(
        (actuales) => {
          const nuevos = new URLSearchParams(actuales)
          for (const [clave, valor] of Object.entries(cambios)) {
            if (valor) nuevos.set(clave, valor)
            else nuevos.delete(clave)
          }
          return nuevos
        },
        { replace: true },
      )
    },
    [setParams],
  )

  const limpiarFiltros = useCallback(() => setParams({}, { replace: true }), [setParams])

  const { estado, cursos, error } = resultado

  // las categorías salen de los cursos que llegan, así no quedan opciones vacías
  const categorias = useMemo(
    () => [...new Set(cursos.map((c) => c.categoria).filter((c): c is string => Boolean(c)))].sort(),
    [cursos],
  )

  // el back todavía no filtra, así que lo hago acá con la lista completa desde el front:
  const busqueda = normalizar(filtros.query.trim())
  const filtrados = cursos.filter(
    (c) =>
      (!filtros.categoria || c.categoria === filtros.categoria) &&
      (!filtros.nivel || c.nivel === filtros.nivel) &&
      (!busqueda || normalizar(`${c.titulo} ${c.resumen}`).includes(busqueda)),
  )
  const hayFiltros = Boolean(filtros.query || filtros.categoria || filtros.nivel)

  const titulo =
    estado === 'listo'
      ? `${filtrados.length} ${filtrados.length === 1 ? 'curso disponible' : 'cursos disponibles'}`
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

      <CourseFilters
        filtros={filtros}
        categorias={categorias}
        onCambiar={cambiarFiltros}
        onLimpiar={limpiarFiltros}
      />

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
        <>
          {/* Los skeletons no se leen en el lector de accesibildiad: le avisamos que está cargando con el texto
          "Cargando cursos" */}
          {estado === 'cargando' && (
            <p role="status" className="sr-only">
              Cargando cursos
            </p>
          )}
          <CourseGrid
            isLoading={estado === 'cargando'}
            isEmpty={estado === 'listo' && filtrados.length === 0}
            // TODO: Texto provisorio, hay que confirmar con Marketing
            emptyMessage={
              hayFiltros
                ? 'Probá con otra palabra o sacá algún filtro.'
                : 'Todavía no hay cursos para mostrar.'
            }
          >
            {filtrados.map(renderCourseCard)}
          </CourseGrid>
        </>
      )}
    </>
  )
}

export default Catalog