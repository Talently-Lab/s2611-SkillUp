import { useParams } from 'react-router-dom'

function AdminCourseForm() {
  const { id } = useParams()
  const mode = id ? 'editar' : 'nuevo'

  return (
    <>
      <h1>AdminCourseForm</h1>
      <p>modo: {mode}</p>
      {id && <p>id: {id}</p>}
    </>
  )
}

export default AdminCourseForm
