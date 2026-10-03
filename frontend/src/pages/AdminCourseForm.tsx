import { useParams } from 'react-router-dom'
import { useTitulo } from '../hooks/useTitulo'

function AdminCourseForm() {
  const { id } = useParams()
  useTitulo(id ? 'Editar curso' : 'Nuevo curso')
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
