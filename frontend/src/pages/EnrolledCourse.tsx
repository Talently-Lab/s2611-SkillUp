import { useParams } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

function EnrolledCourse() {
  const { slug } = useParams()
  useTitulo(slug ?? 'Mi curso')

  return (
    <>
      <h1>EnrolledCourse</h1>
      <p>slug: {slug}</p>
    </>
  )
}

export default EnrolledCourse
