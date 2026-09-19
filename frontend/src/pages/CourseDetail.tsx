import { useParams } from 'react-router-dom'

function CourseDetail() {
  const { slug } = useParams()

  return (
    <>
      <h1>CourseDetail</h1>
      <p>slug: {slug}</p>
    </>
  )
}

export default CourseDetail
