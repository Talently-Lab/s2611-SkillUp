import { NavLink, Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function claseSeccion({ isActive }: { isActive: boolean }) {
  return [
    'rounded-xl px-4 py-2 text-sm font-semibold text-ink transition-colors',
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink',
    isActive ? 'bg-primary' : 'hover:bg-ink/5',
  ].join(' ')
}

function AdminLayout() {
  return (
    <div className="flex min-h-dvh flex-col overflow-x-hidden bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-ink"
      >
        Saltar al contenido
      </a>

      <header>
        <Navbar />
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <nav aria-label="Panel de administración" className="mb-8">
          <div className="inline-flex gap-1 rounded-2xl bg-cream p-1">
            <NavLink to="/admin/cursos" className={claseSeccion}>
              Cursos
            </NavLink>
            <NavLink to="/admin/usuarios" className={claseSeccion}>
              Usuarios
            </NavLink>
          </div>
        </nav>

        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AdminLayout
