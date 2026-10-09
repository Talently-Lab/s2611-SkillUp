import { useAuth } from '../../hooks/useAuth'
import type { Usuario } from '../../lib/sesion'
import Button from '../ui/Button'

// Solo para desarrollo: UiKit lo muestra detrás de import.meta.env.DEV, así que
// no llega al build de producción. Sirve para probar la protección de rutas
// sin backend.

const USUARIOS: Record<Usuario['rol'], Usuario> = {
  alumno: { id: 1, correo: 'alumna@prueba.dev', rol: 'alumno', nombre: 'Ana Prueba' },
  admin: { id: 2, correo: 'admin@prueba.dev', rol: 'admin', nombre: 'Admin Prueba' },
}

function base64url(datos: object) {
  return btoa(JSON.stringify(datos)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

// JWT con la forma real y un exp a 8 horas, para que pase el chequeo de
// vencimiento de sesion.ts. La firma es falsa: el backend lo rechazaría.
function tokenFalso(usuario: Usuario) {
  const ahora = Math.floor(Date.now() / 1000)
  const header = base64url({ alg: 'HS256', typ: 'JWT' })
  const payload = base64url({ sub: usuario.id, rol: usuario.rol, iat: ahora, exp: ahora + 8 * 60 * 60 })
  return `${header}.${payload}.firma-de-prueba`
}

function SesionDePrueba() {
  const { usuario, estaAutenticado, iniciarSesion, cerrarSesion } = useAuth()

  return (
    <section className="mb-10 max-w-xl rounded-2xl border-2 border-dashed border-ink/30 p-6">
      <h2 className="mb-1 text-xl font-semibold">Sesión de prueba</h2>
      <p className="mb-4 text-sm text-ink/70">Solo en desarrollo. No existe en el build de producción.</p>

      <div className="flex flex-wrap items-center gap-3">
        <Button size="sm" onClick={() => iniciarSesion(tokenFalso(USUARIOS.alumno), USUARIOS.alumno)}>
          Simular alumno
        </Button>
        <Button size="sm" onClick={() => iniciarSesion(tokenFalso(USUARIOS.admin), USUARIOS.admin)}>
          Simular admin
        </Button>
        <Button size="sm" variant="secondary" onClick={cerrarSesion} disabled={!estaAutenticado}>
          Cerrar sesión
        </Button>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-xl bg-cream p-4 text-sm">
        {estaAutenticado ? JSON.stringify(usuario, null, 2) : 'Sin sesión'}
      </pre>
    </section>
  )
}

export default SesionDePrueba
