import CatalogCardFooter from '../components/course/CatalogCardFooter'
import CourseCard from '../components/course/CourseCard'
import CourseGrid from '../components/course/CourseGrid'
import { courses } from '../lib/courses'
import { useTitulo } from '../hooks/useTitulo'

function Catalog() {
  useTitulo('Catálogo')

  return (
    <>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-sm font-semibold tracking-wider text-ink/70 uppercase">
            Explorá la oferta académica
          </p>
          <h1 className="mt-1 text-3xl font-bold">{courses.length} cursos disponibles</h1>
        </div>
        <p className="text-sm text-ink/70">
          Contenidos actualizados con proyectos para tu portfolio
        </p>
      </header>

      <CourseGrid isEmpty={courses.length === 0}>
        {courses.map((course) => (
          <CourseCard
            key={course.slug}
            titulo={course.titulo}
            url_portada={course.url_portada}
            categoria={course.categoria}
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
        ))}
      </CourseGrid>
    </>
  )
}

export default Catalog