import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import Alert from '../components/ui/Alert'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Spinner from '../components/ui/Spinner'
import { useCursosAdmin } from '../hooks/useCursosAdmin'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import { nivelLabel, type Course } from '../lib/courses'
import { eliminarCurso } from '../lib/cursosAdmin'

export type Aviso = { tipo: 'success' | 'error'; texto: string }

// El formulario vuelve a esta página con el aviso de "curso creado" o
//  "cambios guardados" en el state de la navegación
function avisoDeNavegacion(state: unknown): Aviso | null {
  if (typeof state === 'object' && state !== null && 'aviso' in state) {
    return state.aviso as Aviso
  }
  return null
}

// Se elige el texto del error según su tipo:
function mensajeError(error: unknown) {
  if (error instanceof ApiError && error.status === 0) return MENSAJE_SIN_CONEXION
  if (error instanceof ApiError && error.status >= 400 && error.status < 500) return error.message
  return MENSAJE_GENERICO
}

function AdminCourses() {
  useTitulo('Administrar cursos')
  const { estado, cursos, error, reintentar, quitarCurso } = useCursosAdmin()
  // El curso que se está por eliminar. Mientras no sea null, el diálogo queda abierto
  const [aEliminar, setAEliminar] = useState<Course | null>(null)
  const [eliminando, setEliminando] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const [aviso, setAviso] = useState<Aviso | null>(() => avisoDeNavegacion(location.state))
  const avisoRef = useRef<HTMLDivElement>(null)

  // Se borra el aviso del historial apenas se lee, así no vuelve a salir al recargar la página
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.state, location.pathname, navigate])

  // La fila borrada se lleva el botón que tenía el focus
  useEffect(() => {
    if (aviso) avisoRef.current?.focus()
  }, [aviso])

  async function confirmarEliminar() {
    if (!aEliminar) return
    setEliminando(true)
    setAviso(null)
    try {
      await eliminarCurso(aEliminar.id)
      quitarCurso(aEliminar.id)
      // TODO: Texto provisorio, hay que confirmar con Marketing
      setAviso({ tipo: 'success', texto: `Eliminaste el curso «${aEliminar.titulo}».` })
    } catch (error) {
      console.error(`No se pudo eliminar el curso ${aEliminar.id}:`, error)
      setAviso({ tipo: 'error', texto: mensajeError(error) })
    } finally {
      setEliminando(false)
      setAEliminar(null)
    }
  }

  return (
    <>
      <AdminPageHeader
        titulo="Cursos"
        // TODO: Texto provisorio, hay que confirmar con Marketing
        descripcion="Creá, editá y eliminá los cursos del catálogo."
        accion={<Button to="/admin/cursos/nuevo">Nuevo curso</Button>}
      />

      {aviso && (
        <Alert variant={aviso.tipo} ref={avisoRef} className="mb-6 max-w-xl">
          {aviso.texto}
        </Alert>
      )}

      {estado === 'cargando' && (
        <div role="status" className="flex items-center gap-3 text-ink/70">
          <Spinner className="size-5" />
          <p>Cargando cursos</p>
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

      {estado === 'listo' && cursos.length === 0 && (
        <p className="text-ink/70">Todavía no hay cursos cargados. Creá el primero en "Nuevo curso".</p>
      )}

      {estado === 'listo' && cursos.length > 0 && (
        <TablaCursos cursos={cursos} onEliminar={setAEliminar} />
      )}

      {/* TODO: Textos provisorios, hay que confirmar con Marketing */}
      <ConfirmDialog
        open={aEliminar !== null}
        titulo="¿Eliminar este curso?"
        mensaje={`Vas a eliminar «${aEliminar?.titulo ?? ''}» y también las inscripciones de sus alumnos. Esta acción no se puede deshacer.`}
        textoConfirmar="Eliminar"
        variante="peligro"
        cargando={eliminando}
        onConfirmar={confirmarEliminar}
        onCancelar={() => setAEliminar(null)}
      />
    </>
  )
}

type TablaCursosProps = {
  cursos: Course[]
  onEliminar: (curso: Course) => void
}

function TablaCursos({ cursos, onEliminar }: TablaCursosProps) {
  return (
    // Necesita 'Focusable' para poder scrollear la tabla con el teclado en mobile también
    <div
      role="region"
      aria-label="Cursos del catálogo"
      tabIndex={0}
      className="w-full max-w-full overflow-x-auto rounded-2xl border border-ink/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <table className="w-full min-w-2xl text-left text-sm">
        <caption className="sr-only">Cursos del catálogo</caption>
        <thead className="bg-cream">
          <tr>
            <th scope="col" className="min-w-56 px-4 py-3 font-semibold">
              Curso
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Categoría
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Nivel
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Clases
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              Estado
            </th>
            <th scope="col" className="px-4 py-3 font-semibold">
              <span className="sr-only">Acciones</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-ink/10">
          {cursos.map((curso) => (
            <tr key={curso.id}>
              <th scope="row" className="px-4 py-3 font-normal">
                <span className="block font-semibold">{curso.titulo}</span>
                <span className="block text-xs text-ink/70">/{curso.slug}</span>
              </th>
              <td className="px-4 py-3">
                {curso.categoria ? (
                  <Badge tone="brand">{curso.categoria}</Badge>
                ) : (
                  <span className="text-ink/60">Sin categoría</span>
                )}
              </td>
              <td className="px-4 py-3">{nivelLabel[curso.nivel] ?? curso.nivel}</td>
              <td className="px-4 py-3 tabular-nums">{curso.cantidad_clases}</td>
              <td className="px-4 py-3">
                {/* ACtualmente la lista solo trae publicados y sin el campo, por eso
                    undefined cuenta como publicado. Hay que coordinar con backend. */}
                {curso.publicado === false ? (
                  <Badge>Borrador</Badge>
                ) : (
                  <Badge tone="success">Publicado</Badge>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  {/* sr-only: el nombre oculto sirve para el lector de pantalla (accesibilidad),
                   que si no escucharía "Editar" y "Eliminar" repetidos en cada fila */}
                  <Button variant="secondary" size="sm" to={`/admin/cursos/${curso.id}/editar`}>
                    Editar<span className="sr-only"> {curso.titulo}</span>
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => onEliminar(curso)}>
                    Eliminar<span className="sr-only"> {curso.titulo}</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default AdminCourses
