import { useParams } from 'react-router-dom'

function EnrolledCourse() {
  const { slug } = useParams()

  return (
    <>
      <h1>EnrolledCourse</h1>
      <p>slug: {slug}</p>
    </>
  )
}

export default EnrolledCourse
