import { useParams } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

function CourseDetail() {
  const { slug } = useParams()
  useTitulo(slug ?? 'Detalle del curso')

  return (
    <>
      <h1>CourseDetail</h1>
      <p>slug: {slug}</p>
    </>
  )
}

export default CourseDetail
