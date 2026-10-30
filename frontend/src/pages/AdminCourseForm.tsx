import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AdminPageHeader from '../components/admin/AdminPageHeader'
import Alert from '../components/ui/Alert'
import Button from '../components/ui/Button'
import FormField from '../components/ui/FormField'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import Spinner from '../components/ui/Spinner'
import Textarea from '../components/ui/Textarea'
import { useAuthForm } from '../hooks/useAuthForm'
import { useTitulo } from '../hooks/useTitulo'
import { ApiError, MENSAJE_GENERICO, MENSAJE_SIN_CONEXION } from '../lib/apiClient'
import { nivelLabel, obtenerCurso, type Course } from '../lib/courses'
import { actualizarCurso, crearCurso } from '../lib/cursosAdmin'
import { CATEGORIAS, NIVELES, cursoSchema, type CursoFormDatos } from '../lib/validaciones'
import type { Aviso } from './AdminCourses'

// Textos de ayuda de Marketing:
const AYUDA = {
  titulo: 'Sé claro y directo. Usá palabras clave que ayuden a los alumnos a encontrar este curso al toque.',
  descripcion: 'Enfocate en lo que el alumno va a lograr (ej: «Construí tu primera app»), no solo en la teoría.',
  nivel: 'Indicá si es para principiantes, intermedios o avanzados. Así nos aseguramos de que nadie se confunda.',
  imagen: 'Cargá una imagen en formato horizontal para que el curso se luzca espectacular en el catálogo.',
}

// Esta función pasa el título a slug: "Diseño UX/UI desde Cero" queda "diseno-ux-ui-desde-cero"
function aSlug(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca los acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // reged para que todo lo que no es letra o número pasa a guion
    .replace(/^-+|-+$/g, '') // sin guiones al principio ni al final
}

function mayuscula(texto: string) {
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

type Carga =
  | { estado: 'cargando' }
  | { estado: 'listo'; curso: Course | null } // null para curso nuevo
  | { estado: 'noEncontrado' }
  | { estado: 'error'; error: unknown }

// Una sola página para las dos rutas, con y sin id, por ejemplo:
//  /admin/cursos/nuevo y /admin/cursos/:id/editar
function AdminCourseForm() {
  const { id } = useParams()
  // Si cambia el id en la URL (por ejemplo: de /cursos/1/editar a /cursos/3/editar), la key
  // hace que el formulario se arme de cero y no quede con los datos del curso anterior!
  return <ContenidoFormulario key={id ?? 'nuevo'} id={id} />
}

function ContenidoFormulario({ id }: { id?: string }) {
  const esEdicion = id !== undefined
  useTitulo(esEdicion ? 'Editar curso' : 'Nuevo curso')
  const [carga, setCarga] = useState<Carga>(() =>
    esEdicion ? { estado: 'cargando' } : { estado: 'listo', curso: null },
  )
  const [intento, setIntento] = useState(0)

  // Al editar hay que traer el curso primero para llenar el formulario
  useEffect(() => {
    if (!id) return
    const controlador = new AbortController()
    obtenerCurso(id, controlador.signal)
      .then((curso) => {
        if (controlador.signal.aborted) return
        setCarga({ estado: 'listo', curso })
      })
      .catch((error: unknown) => {
        if (controlador.signal.aborted) return
        if (error instanceof ApiError && error.status === 404) {
          setCarga({ estado: 'noEncontrado' })
          return
        }
        console.error(`No se pudo cargar el curso ${id} para editarlo:`, error)
        setCarga({ estado: 'error', error })
      })
    return () => controlador.abort()
  }, [id, intento])

  function reintentar() {
    setCarga({ estado: 'cargando' })
    setIntento((n) => n + 1)
  }

  return (
    <>
      <Link
        to="/admin/cursos"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-ink/70 hover:text-ink"
      >
        <span aria-hidden="true">←</span> Volver a cursos
      </Link>

      <AdminPageHeader
        titulo={esEdicion ? 'Editar curso' : 'Nuevo curso'}
        // TODO: Texto provisorio, hay que confirmar con Marketing
        descripcion={
          esEdicion
            ? 'Los cambios se ven en el catálogo apenas los guardás.'
            : 'Completá los datos del curso. Los marcados con * son obligatorios.'
        }
      />

      {carga.estado === 'cargando' && (
        <div role="status" className="flex items-center gap-3 text-ink/70">
          <Spinner className="size-5" />
          <p>Cargando curso</p>
        </div>
      )}

      {carga.estado === 'noEncontrado' && (
        <div className="flex max-w-xl flex-col items-start gap-4">
          {/* TODO: Texto provisorio, hay que confirmar con Marketing */}
          <Alert>No encontramos este curso. Puede que lo hayan eliminado.</Alert>
          <Button variant="secondary" to="/admin/cursos">
            Volver a cursos
          </Button>
        </div>
      )}

      {carga.estado === 'error' && (
        <div className="flex max-w-xl flex-col items-start gap-4">
          <Alert>
            {carga.error instanceof ApiError && carga.error.status === 0
              ? MENSAJE_SIN_CONEXION
              : MENSAJE_GENERICO}
          </Alert>
          <Button variant="secondary" onClick={reintentar}>
            Reintentar
          </Button>
        </div>
      )}

      {carga.estado === 'listo' && <FormularioCurso curso={carga.curso} />}
    </>
  )
}

function FormularioCurso({ curso }: { curso: Course | null }) {
  const navigate = useNavigate()
  const esEdicion = curso !== null

  // useState para poder armar el slug a medida que se escribe el título, y para
  // poder mostrarlo en el hint del campo slug. El resto de los campos se leen al
  // enviar, como en Login y Registro
  const [titulo, setTitulo] = useState(curso?.titulo ?? '')
  const [slug, setSlug] = useState(curso?.slug ?? '')
  // Si el admin escribe el slug a mano, se deja de armar solo. Al editar arranca
  // en true porque cambiar el slug de un curso existente rompe los links previos:
  const [slugManual, setSlugManual] = useState(esEdicion)

  // Si el curso trae una categoría que no está en la lista se suma como opción,
  // así guardar sin tocarla no la borra
  const categoriaActual = curso?.categoria ?? ''
  const categorias: string[] =
    categoriaActual && !(CATEGORIAS as readonly string[]).includes(categoriaActual)
      ? [...CATEGORIAS, categoriaActual]
      : [...CATEGORIAS]
  const nivelActual = (NIVELES as readonly string[]).includes(curso?.nivel ?? '')
    ? curso?.nivel
    : 'inicial'

  async function guardar(datos: CursoFormDatos) {
    const guardado = curso ? await actualizarCurso(curso.id, datos) : await crearCurso(datos)

    // El de crear es el texto de Marketing de la semana 4.
    // TODO: El de editar es texto provisorio, hay que confirmar con Marketing
    const aviso: Aviso = {
      tipo: 'success',
      texto: esEdicion
        ? `Guardaste los cambios de «${guardado.titulo}».`
        : '¡Excelente! El nuevo curso se creó con éxito. Ya está subido al catálogo y listo para que los estudiantes den su próximo salto en tech.',
    }
    navigate('/admin/cursos', { state: { aviso } })
  }

  // Mismo hook que login y registro. Valida con zod, marca el error en cada campo
  // y devuelve el focus. los textos siguen el status de la API
  const { errores, errorGeneral, enviando, alertRef, handleSubmit } = useAuthForm(
    cursoSchema,
    guardar,
    {
      // TODO: Textos provisorios, hay que confirmar con Marketing
      403: 'Tu cuenta no tiene permiso para administrar cursos.',
      404: 'Este curso ya no existe. Puede que lo hayan eliminado.',
      // TODO: El back todavía responde 500 con un slug repetido, debe retornar 409
      409: 'Ya existe un curso con ese slug. Probá con otro.',
    },
  )

  return (
    <form noValidate onSubmit={handleSubmit} className="flex max-w-2xl flex-col gap-5">
      {errorGeneral && <Alert ref={alertRef}>{errorGeneral}</Alert>}

      <FormField label="Título" hint={AYUDA.titulo} error={errores.titulo} required>
        <Input
          name="titulo"
          value={titulo}
          onChange={(evento) => {
            setTitulo(evento.target.value)
            if (!slugManual) setSlug(aSlug(evento.target.value))
          }}
        />
      </FormField>

      <FormField
        label="Slug"
        // TODO: Texto provisorio, hay que confirmar con Marketing
        hint={
          esEdicion
            ? `Es el final de la dirección del curso: /cursos/${slug || 'mi-curso'}. Si lo cambiás, los links que ya se compartieron dejan de andar.`
            : `Es el final de la dirección del curso: /cursos/${slug || 'mi-curso'}. Se arma solo a partir del título.`
        }
        error={errores.slug}
        required
      >
        <Input
          name="slug"
          value={slug}
          onChange={(evento) => {
            setSlug(evento.target.value)
            setSlugManual(true)
          }}
        />
      </FormField>

      <FormField
        label="Resumen"
        // TODO: Texto provisorio, hay que confirmar con Marketing
        hint="Una o dos líneas. Es lo que se ve en la tarjeta del catálogo."
        error={errores.resumen}
      >
        <Input name="resumen" defaultValue={curso?.resumen ?? ''} />
      </FormField>

      <FormField label="Descripción" hint={AYUDA.descripcion} error={errores.descripcion}>
        <Textarea name="descripcion" defaultValue={curso?.descripcion ?? ''} />
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Categoría" error={errores.categoria}>
          <Select name="categoria" defaultValue={categoriaActual}>
            <option value="">Sin categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria} value={categoria}>
                {mayuscula(categoria)}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Nivel" hint={AYUDA.nivel} error={errores.nivel} required>
          <Select name="nivel" defaultValue={nivelActual}>
            {NIVELES.map((nivel) => (
              <option key={nivel} value={nivel}>
                {nivelLabel[nivel]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <FormField label="URL de la imagen" hint={AYUDA.imagen} error={errores.url_portada}>
        <Input
          name="url_portada"
          inputMode="url"
          placeholder="https://"
          defaultValue={curso?.url_portada ?? ''}
        />
      </FormField>

      {/* Ahora no tenemos check de publicado, un curso en el borrador desaparece de la table porque 
      el back sólo trae los cursos publicados (no tiene sentido volver a publicarlo). Vuelve cuando haya lista para admin. */}
      {!esEdicion && (
        // TODO: Texto provisorio, hay que confirmar con Marketing
        <p className="text-sm text-ink/70">Al crearlo, el curso queda publicado en el catálogo.</p>
      )}

      <div className="mt-2 flex flex-col gap-3 sm:flex-row">
        {/* TODO: Textos provisorios, hay que confirmar con Marketing */}
        <Button type="submit" loading={enviando}>
          {esEdicion ? 'Guardar cambios' : 'Crear curso'}
        </Button>
        <Button variant="secondary" to="/admin/cursos">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export default AdminCourseForm
