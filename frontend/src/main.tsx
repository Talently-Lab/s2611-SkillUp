import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import AuthProvider from './context/AuthProvider.tsx'
import './index.css'
import { router } from './router.tsx'
import { iniciarAnalitica } from './lib/analytics'

// Los mocks solo existen en desarrollo: en el build import.meta.env.DEV es
// false, Vite descarta el import dinámico y msw no llega al bundle.
async function iniciarMocks() {
  if (!(import.meta.env.DEV && import.meta.env.VITE_MOCKS === 'true')) return
  const { worker } = await import('./mocks/browser')
  // Lo que no tiene handler (login, registro) sigue yendo al backend real
  await worker.start({ onUnhandledRequest: 'bypass' })
}

// GA4 se carga antes del renderizado para que no se pierda la primera vista
iniciarAnalitica()

// Si los mocks fallan, la app arranca igual contra el backend real
iniciarMocks()
  .catch((error: unknown) => console.error('No se pudieron iniciar los mocks:', error))
  .then(() => {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </StrictMode>,
    )
  })
