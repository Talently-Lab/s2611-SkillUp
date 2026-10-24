import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

const navLinkBase = 'text-sm sm:text-base transition-colors'

function claseLink({ isActive }: { isActive: boolean }) {
  return `${navLinkBase} ${isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`
}

function Navbar() {
  const { usuario, cerrarSesion } = useAuth()
  const navigate = useNavigate()

  // Si se está en una ruta protegida (/perfil, /mis-cursos), RutaProtegida
  // renderiza antes que esta navegación y es la que lleva al inicio, porque
  // motivoCierre es 'manual'. Esta navegación cubre las rutas públicas.
  function salir() {
    cerrarSesion()
    navigate('/', { replace: true })
  }

  return (
    <nav aria-label="Principal" className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <NavLink to="/" className="font-display text-lg font-semibold text-ink sm:text-xl">
        SkillUp Campus
      </NavLink>

      <div className="flex flex-wrap items-center gap-4">
        <NavLink to="/cursos" className={claseLink}>
          Cursos
        </NavLink>

        {!usuario && (
          <>
            <NavLink to="/login" className={claseLink}>
              Iniciar sesión
            </NavLink>
            <NavLink
              to="/registro"
              className={({ isActive }) =>
                `${navLinkBase} rounded-md bg-primary px-3 py-1.5 font-medium text-ink ${
                  isActive ? 'bg-primary-soft' : 'hover:bg-primary-soft'
                }`
              }
            >
              Registrarse
            </NavLink>
          </>
        )}

        {usuario?.rol === 'alumno' && (
          <>
            <NavLink to="/mis-cursos" className={claseLink}>
              Mis cursos
            </NavLink>
            <NavLink to="/perfil" className={claseLink}>
              Perfil
            </NavLink>
          </>
        )}

        {usuario?.rol === 'admin' && (
          <NavLink to="/admin" className={claseLink}>
            Admin
          </NavLink>
        )}

        {usuario && (
          <button
            type="button"
            onClick={salir}
            className={`${navLinkBase} cursor-pointer text-ink/70 hover:text-ink`}
          >
            Cerrar sesión
          </button>
        )}
      </div>
    </nav>
  )
}

export default Navbar
