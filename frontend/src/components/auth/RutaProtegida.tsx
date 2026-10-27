import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { rutaInicioPorRol, type Rol } from '../../lib/sesion'

type RutaProtegidaProps = {
  // Sin roles alcanza con tener sesión
  roles?: Rol[]
}

// Esto es UX: evita mostrar pantallas que no corresponden. La seguridad real
// es el 401/403 del backend, que no depende de lo que haga el frontend.
function RutaProtegida({ roles }: RutaProtegidaProps) {
  const { usuario, motivoCierre } = useAuth()
  const location = useLocation()

  if (!usuario) {
    // Al cerrar sesión desde el navbar, setUsuario(null) se renderiza antes que
    // la navegación al inicio (React Router la hace dentro de un startTransition),
    // con esta ruta todavía montada. Sin esto terminaría en /login.
    if (motivoCierre === 'manual') return <Navigate to="/" replace />
    return <Navigate to="/login" replace state={{ desde: location }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />
  }

  return <Outlet />
}

export default RutaProtegida
