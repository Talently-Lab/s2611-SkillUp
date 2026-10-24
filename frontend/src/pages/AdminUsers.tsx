import AdminPageHeader from '../components/admin/AdminPageHeader'
import { useTitulo } from '../hooks/useTitulo'

function AdminUsers() {
  useTitulo('Administrar usuarios')

  return (
    <AdminPageHeader
      titulo="Usuarios"
      // Texto provisorio: confirmar con Marketing
      descripcion="Consultá quiénes están registrados en la plataforma."
    />
  )
}

export default AdminUsers
