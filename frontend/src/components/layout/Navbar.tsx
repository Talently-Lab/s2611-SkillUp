import { NavLink } from 'react-router-dom'

const navLinkBase = 'text-sm sm:text-base transition-colors'

function Navbar() {
  return (
    <nav className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
      <NavLink to="/" className="font-display text-lg font-semibold text-ink sm:text-xl">
        SkillUp Campus
      </NavLink>

      <div className="flex flex-wrap items-center gap-4">
        <NavLink
          to="/cursos"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`
          }
        >
          Cursos
        </NavLink>
        <NavLink
          to="/login"
          className={({ isActive }) =>
            `${navLinkBase} ${isActive ? 'text-ink' : 'text-ink/70 hover:text-ink'}`
          }
        >
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
      </div>
    </nav>
  )
}

export default Navbar
