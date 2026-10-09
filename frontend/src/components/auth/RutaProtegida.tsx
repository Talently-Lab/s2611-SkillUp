import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import type { Rol } from '../../lib/sesion'

type RutaProtegidaProps = {
  // Sin roles alcanza con tener sesión
  roles?: Rol[]
}

// Esto es UX: evita mostrar pantallas que no corresponden. La seguridad real
// es el 401/403 del backend, que no depende de lo que haga el frontend.
function RutaProtegida({ roles }: RutaProtegidaProps) {
  const { usuario } = useAuth()
  const location = useLocation()

  if (!usuario) {
    return <Navigate to="/login" replace state={{ desde: location }} />
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

export default RutaProtegida
