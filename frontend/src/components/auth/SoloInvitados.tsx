import { Navigate, Outlet, useLocation, type Location } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

// El state del historial puede traer cualquier cosa: solo se usa si tiene la
// forma del location que guarda RutaProtegida.
function leerDesde(state: unknown): Location | null {
  if (typeof state !== 'object' || state === null || !('desde' in state)) return null
  const desde = state.desde
  if (typeof desde !== 'object' || desde === null || !('pathname' in desde)) return null
  return typeof desde.pathname === 'string' ? (desde as Location) : null
}

// Para /login y /registro. Es el único que decide a dónde se va después de
// iniciar sesión: Login solo llama a iniciarSesion y no navega. Si un alumno
// tenía "desde" en /admin no hace falta validar el rol acá, porque
// RutaProtegida ya lo manda al inicio.
function SoloInvitados() {
  const { usuario } = useAuth()
  const location = useLocation()

  if (usuario) {
    const desde = leerDesde(location.state)
    const destino = desde
      ? { pathname: desde.pathname, search: desde.search, hash: desde.hash }
      : usuario.rol === 'admin'
        ? '/admin'
        : '/mis-cursos'
    return <Navigate to={destino} replace />
  }

  return <Outlet />
}

export default SoloInvitados
