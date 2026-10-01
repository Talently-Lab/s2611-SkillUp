export type Course = {
  slug: string
  title: string
  description: string
  imageUrl: string
}

const PLACEHOLDER_IMAGE = 'https://placehold.co/640x360?text=Curso'

export const courses: Course[] = [
  {
    slug: 'react-desde-cero',
    title: 'React desde cero',
    description: 'Aprendé los fundamentos de React: componentes, props y estado, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: 'python-desde-cero',
    title: 'Python desde cero',
    description: 'Aprendé los fundamentos de Python: variables, tipos de datos, estructuras de control y funciones, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: 'javascript-desde-cero',
    title: 'JavaScript desde cero',
    description: 'Aprendé los fundamentos de JavaScript: variables, tipos de datos, estructuras de control y funciones, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: 'html-css-desde-cero',
    title: 'HTML y CSS desde cero',
    description: 'Aprendé los fundamentos de HTML y CSS: etiquetas, selectores, propiedades y diseño web, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: 'nodejs-desde-cero',
    title: 'Node.js desde cero',
    description: 'Aprendé los fundamentos de Node.js: módulos, eventos, streams y servidores web, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
  {
    slug: 'sql-desde-cero',
    title: 'SQL desde cero',
    description: 'Aprendé los fundamentos de SQL: consultas, joins, subconsultas y funciones agregadas, construyendo una app paso a paso.',
    imageUrl: PLACEHOLDER_IMAGE,
  },
]