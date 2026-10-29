import AdminPageHeader from '../components/admin/AdminPageHeader'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import { useTitulo } from '../hooks/useTitulo'
import { useUsuarios } from '../hooks/useUsuarios'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import type { Usuario } from '../lib/usuarios'

const formatoFecha = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

// es-AR escribe "12 de oct de 2026"; el diseño pide "12 oct 2026"
function formatearFecha(iso: string) {
  return formatoFecha
    .formatToParts(new Date(iso))
    .filter((parte) => parte.type !== 'literal')
    .map((parte) => parte.value)
    .join(' ')
}

const ROLES: Record<Usuario['rol'], { label: string; tone: 'dark' | 'neutral' }> = {
  admin: { label: 'Admin', tone: 'dark' },
  alumno: { label: 'Alumno', tone: 'neutral' },
}

function AdminUsers() {
  useTitulo('Administrar usuarios')
  const { estado, usuarios, error, reintentar } = useUsuarios()

  return (
    <>
      <AdminPageHeader
        titulo="Usuarios"
        // Texto provisorio: confirmar con Marketing
        descripcion="Consultá quiénes están registrados en la plataforma."
      />

      {estado === 'cargando' && (
        <div role="status" className="flex items-center gap-3 text-ink/70">
          <Spinner className="size-5" />
          <p>Cargando usuarios</p>
        </div>
      )}

      {estado === 'error' && (
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Alert>
            {error instanceof ApiError && error.status === 0
              ? MENSAJE_SIN_CONEXION
              : MENSAJE_GENERICO}
          </Alert>
          <Button variant="secondary" onClick={reintentar}>
            Reintentar
          </Button>
        </div>
      )}

      {estado === 'listo' && usuarios.length === 0 && (
        // Texto provisorio: confirmar con Marketing
        <p className="text-ink/70">Todavía no hay usuarios registrados.</p>
      )}

      {estado === 'listo' && usuarios.length > 0 && <TablaUsuarios usuarios={usuarios} />}
    </>
  )
}

function TablaUsuarios({ usuarios }: { usuarios: Usuario[] }) {
  return (
    // Focusable para que en mobile se pueda scrollear la tabla con el teclado
    <div
      role="region"
      aria-label="Usuarios registrados"
      tabIndex={0}
      className="overflow-x-auto rounded-2xl border border-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <table className="w-full min-w-xl text-left text-sm">
        <caption className="sr-only">Usuarios registrados en la plataforma</caption>
        <thead className="bg-cream">
          <tr>
            <th scope="col" className="px-4 py-3 font-semibold">
              Usuario
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Rol
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Fecha de registro
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {usuarios.map((usuario) => (
            <tr key={usuario.id}>
              <th scope="row" className="px-4 py-3 font-normal">
                {usuario.nombre ? (
                  <>
                    <span className="block font-semibold">{usuario.nombre}</span>
                    <span className="block text-xs text-ink/70">{usuario.correo}</span>
                  </>
                ) : (
                  <span className="block font-semibold">{usuario.correo}</span>
                )}
              </th>
              <td className="px-4 py-3">
                <Badge tone={ROLES[usuario.rol].tone}>{ROLES[usuario.rol].label}</Badge>
              </td>
              <td className="px-4 py-3 whitespace-nowrap">
                <time dateTime={usuario.fechaRegistro}>{formatearFecha(usuario.fechaRegistro)}</time>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminUsers
