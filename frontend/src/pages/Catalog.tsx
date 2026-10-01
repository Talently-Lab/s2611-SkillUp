import CourseCard from '../components/course/CourseCard'

function Catalog() {
  return (
    <>
      <h1>Catalog</h1>
      <div className="max-w-sm">
        <CourseCard
          slug="react-desde-cero"
          title="React desde cero"
          description="Aprendé los fundamentos de React: componentes, props y estado, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
        <CourseCard
          slug="python-desde-cero"
          title="Python desde cero"
          description="Aprendé los fundamentos de Python: variables, tipos de datos, estructuras de control y funciones, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
        <CourseCard
          slug="javascript-desde-cero"
          title="JavaScript desde cero"
          description="Aprendé los fundamentos de JavaScript: variables, tipos de datos, estructuras de control y funciones, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
        <CourseCard
          slug="html-css-desde-cero"
          title="HTML y CSS desde cero"
          description="Aprendé los fundamentos de HTML y CSS: etiquetas, selectores, propiedades y diseño web, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
        <CourseCard
          slug="nodejs-desde-cero"
          title="Node.js desde cero"
          description="Aprendé los fundamentos de Node.js: módulos, eventos, streams y servidores web, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
        <CourseCard
          slug="sql-desde-cero"
          title="SQL desde cero"
          description="Aprendé los fundamentos de SQL: consultas, joins, subconsultas y funciones agregadas, construyendo una app paso a paso."
          imageUrl="https://placehold.co/640x360?text=Curso"
        />
      </div>
    </>
  )
}

export default Catalog