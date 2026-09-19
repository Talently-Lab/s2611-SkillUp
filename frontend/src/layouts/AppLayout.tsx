import { Link, Outlet } from 'react-router-dom'

function AppLayout() {
  return (
    <>
      {/* Nav TEMPORAL para probar las rutas a mano. La reemplaza el Navbar real en FE-06. */}
      <nav>
        <Link to="/">Home</Link>
        {' | '}
        <Link to="/cursos">Catalog</Link>
        {' | '}
        <Link to="/cursos/ejemplo-slug">CourseDetail</Link>
        {' | '}
        <Link to="/mis-cursos">Dashboard</Link>
        {' | '}
        <Link to="/mis-cursos/ejemplo-slug">EnrolledCourse</Link>
        {' | '}
        <Link to="/perfil">Profile</Link>
        {' | '}
        <Link to="/login">Login</Link>
        {' | '}
        <Link to="/registro">Register</Link>
        {' | '}
        <Link to="/admin">Admin</Link>
        {' | '}
        <Link to="/ruta-inexistente">NotFound</Link>
      </nav>
      <Outlet />
    </>
  )
}

export default AppLayout
