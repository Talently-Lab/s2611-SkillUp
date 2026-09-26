import { Outlet } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function AppLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:font-medium focus:text-ink"
      >
        Saltar al contenido
      </a>

      <header>
        <Navbar />
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default AppLayout
