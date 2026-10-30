import { delay, http, HttpResponse } from 'msw'
import { courses, type Course } from '../lib/courses'
import type { Inscripcion } from '../lib/inscripciones'
import type { ClaseApi } from '../lib/misCursos'
import type { UsuarioApi } from '../lib/usuarios'

// Simula las rutas del brief que el backend todavía no tiene. Solo corre en
// desarrollo con VITE_MOCKS=true (ver main.tsx). Lo que no está acá, como login
// y registro, sigue yendo al backend real.

// Las rutas empiezan con * para que coincidan con cualquier VITE_API_URL
const RUTA_CURSOS = '*/api/courses'
const RUTA_INSCRIPCIONES = '*/api/enrollments'
const RUTA_MIS_INSCRIPCIONES = '*/api/enrollments/me'
const RUTA_USUARIOS = '*/api/admin/users'
const RUTA_MIS_CURSOS = '*/api/mis-cursos/:slug'
const RUTA_PROGRESO = '*/api/progreso'

const CLAVE_INSCRIPCIONES = 'skillup.mock.inscripciones'
// Las clases vistas de cada inscripción: { [id_inscripcion]: [id_clase, ...] }
const CLAVE_PROGRESO = 'skillup.mock.progreso'
// "500" hace fallar todos los pedidos; "lento" los demora 3 segundos
const CLAVE_FORZAR = 'skillup.mock.forzar'

const DEMORA = 600
const DEMORA_LENTA = 3000

// Fijos: el panel solo los lista. Hay un admin y uno sin nombre para ver los
// dos casos de la tabla.
const USUARIOS: UsuarioApi[] = [
  { id: 1, nombre: 'Lucía Fernández', correo: 'lucia.fernandez@email.com', rol: 'admin', fecha_registro: '2026-03-02T13:15:00Z' },
  { id: 2, nombre: 'Martín Gómez', correo: 'martin.gomez@email.com', rol: 'alumno', fecha_registro: '2026-05-18T21:40:00Z' },
  { id: 3, nombre: null, correo: 'sofi.rodriguez@email.com', rol: 'alumno', fecha_registro: '2026-07-07T10:05:00Z' },
  { id: 4, nombre: 'Julián Pérez', correo: 'julian.perez@email.com', rol: 'alumno', fecha_registro: '2026-08-23T16:30:00Z' },
  { id: 5, nombre: 'Camila Sosa', correo: 'camila.sosa@email.com', rol: 'alumno', fecha_registro: '2026-09-30T12:00:00Z' },
  { id: 6, nombre: 'Tomás Díaz', correo: 'tomas.diaz@email.com', rol: 'alumno', fecha_registro: '2026-10-12T15:20:00Z' },
]

// Las mismas para todos los cursos. La primera no tiene url_externa y la
// segunda sí, así siempre se ven los dos casos.
const CLASES_DE_EJEMPLO: Pick<ClaseApi, 'titulo' | 'descripcion' | 'contenido_texto' | 'url_externa'>[] = [
  {
    titulo: 'Bienvenida y presentación del curso',
    descripcion: 'Qué vas a aprender y cómo está organizado el curso.',
    contenido_texto: 'Te damos la bienvenida.\n\nEn esta clase repasamos los objetivos del curso, cómo se organizan las clases y qué necesitás para empezar.',
    url_externa: null,
  },
  {
    titulo: 'Herramientas que vas a usar',
    descripcion: 'Instalación y configuración del entorno de trabajo.',
    contenido_texto: 'Antes de arrancar, dejá listo tu entorno:\n1. Un editor de código.\n2. Un navegador actualizado.\n3. Una cuenta para guardar tus proyectos.',
    url_externa: 'https://developer.mozilla.org/es/',
  },
  {
    titulo: 'Primer ejercicio práctico',
    descripcion: 'Ponés en práctica lo visto con un ejercicio guiado.',
    contenido_texto: 'Seguí los pasos del enunciado y, cuando termines, compará tu resultado con la solución propuesta.',
    url_externa: null,
  },
  {
    titulo: 'Recursos para seguir aprendiendo',
    descripcion: null,
    contenido_texto: 'Una selección de lecturas y documentación para profundizar por tu cuenta.',
    url_externa: 'https://web.dev/learn',
  },
  {
    titulo: 'Cierre y próximos pasos',
    descripcion: 'Repaso de lo aprendido.',
    contenido_texto: null,
    url_externa: null,
  },
]

// Entre 3 y 5 según el id, y nunca más que cantidad_clases: el curso sin clases
// devuelve la lista vacía. El id de cada clase es el del curso * 100 + su orden.
function clasesDelCurso(curso: Course): Omit<ClaseApi, 'completada'>[] {
  const cantidad = Math.min(curso.cantidad_clases, 3 + (curso.id % 3))
  return CLASES_DE_EJEMPLO.slice(0, cantidad).map((clase, i) => ({
    ...clase,
    id: curso.id * 100 + i + 1,
    orden: i + 1,
  }))
}

// Lo que se guarda en localStorage. El curso se arma al responder, a partir de
// lib/courses.ts, para que un cambio en los cursos se vea sin borrar nada.
// clases_completadas se puede editar a mano para probar la barra de progreso.
type InscripcionGuardada = Omit<Inscripcion, 'curso'> & { course_id: number }

function leerLocal(clave: string) {
  try {
    return localStorage.getItem(clave)
  } catch {
    return null
  }
}

function leerInscripciones(): InscripcionGuardada[] {
  try {
    const datos: unknown = JSON.parse(leerLocal(CLAVE_INSCRIPCIONES) ?? '[]')
    return Array.isArray(datos) ? (datos as InscripcionGuardada[]) : []
  } catch {
    return []
  }
}

function guardarInscripciones(inscripciones: InscripcionGuardada[]) {
  try {
    localStorage.setItem(CLAVE_INSCRIPCIONES, JSON.stringify(inscripciones))
  } catch {
    // Sin localStorage las inscripciones no sobreviven a F5, pero el mock sigue
  }
}

function activaDelCurso(inscripciones: InscripcionGuardada[], courseId: number) {
  return inscripciones.find((i) => i.course_id === courseId && i.estado === 'activa')
}

function leerProgreso(): Record<string, number[]> {
  try {
    const datos: unknown = JSON.parse(leerLocal(CLAVE_PROGRESO) ?? '{}')
    return typeof datos === 'object' && datos !== null && !Array.isArray(datos)
      ? (datos as Record<string, number[]>)
      : {}
  } catch {
    return {}
  }
}

function guardarProgreso(progreso: Record<string, number[]>) {
  try {
    localStorage.setItem(CLAVE_PROGRESO, JSON.stringify(progreso))
  } catch {
    // Igual que las inscripciones: sin localStorage no sobrevive a F5
  }
}

// Une la inscripción guardada con su curso. null si el curso ya no existe.
function conCurso({ course_id, ...inscripcion }: InscripcionGuardada): Inscripcion | null {
  const curso = courses.find((c) => c.id === course_id)
  if (!curso) return null
  const { id, slug, titulo, url_portada, categoria, cantidad_clases } = curso
  return {
    ...inscripcion,
    curso: { id, slug, titulo, url_portada, categoria, cantidad_clases },
  }
}

// Errores con el formato actual del backend ({ error, mensaje }), que es el
// que hoy lee el apiClient
function error(status: number, etiqueta: string, mensaje: string) {
  return HttpResponse.json({ error: etiqueta, mensaje }, { status })
}

// Demora de red y fallas forzadas, comunes a todos los handlers. Devuelve una
// respuesta si el pedido tiene que fallar.
async function simularRed() {
  const forzar = leerLocal(CLAVE_FORZAR)
  await delay(forzar === 'lento' ? DEMORA_LENTA : DEMORA)
  // Sin mensaje a propósito: así el apiClient muestra MENSAJE_GENERICO
  if (forzar === '500') return HttpResponse.json({ error: 'Error interno' }, { status: 500 })
}

// El mock no valida el token: alcanza con que venga. Uno vencido ni sale del
// navegador, porque leerSesion lo descarta antes.
function tieneToken(request: Request) {
  return request.headers.get('Authorization')?.startsWith('Bearer ') ?? false
}

function sinToken() {
  return error(401, 'No autorizado', 'Tenés que iniciar sesión para continuar.')
}

function noInscripto() {
  return error(403, 'Prohibido', 'No estás inscripto/a en este curso.')
}

export const handlers = [
  http.get(RUTA_CURSOS, async () => {
    const falla = await simularRed()
    if (falla) return falla

    // Paginado como pide el contrato, aunque por ahora entra todo en una página
    return HttpResponse.json({
      datos: courses,
      pagina: 1,
      totalPaginas: 1,
      total: courses.length,
    })
  }),

  http.get(`${RUTA_CURSOS}/:slug`, async ({ params }) => {
    const falla = await simularRed()
    if (falla) return falla

    const curso = courses.find(
      (c) => c.slug === params.slug || String(c.id) === params.slug,
    )
    if (!curso) return error(404, 'No encontrado', 'El curso no existe.')

    return HttpResponse.json(curso)
  }),

  http.post(RUTA_INSCRIPCIONES, async ({ request }) => {
    const falla = await simularRed()
    if (falla) return falla
    if (!tieneToken(request)) return sinToken()

    const cuerpo: unknown = await request.json().catch(() => null)
    const courseId =
      typeof cuerpo === 'object' && cuerpo !== null && 'course_id' in cuerpo
        ? cuerpo.course_id
        : undefined
    if (typeof courseId !== 'number') {
      return error(400, 'Datos incompletos', 'Falta el curso al que te querés inscribir.')
    }
    if (!courses.some((c) => c.id === courseId)) {
      return error(404, 'No encontrado', 'El curso no existe.')
    }

    const inscripciones = leerInscripciones()
    if (inscripciones.some((i) => i.course_id === courseId)) {
      return error(409, 'Conflicto', 'Ya estás inscripto/a en este curso.')
    }

    const nueva: InscripcionGuardada = {
      id_inscripcion: Math.max(0, ...inscripciones.map((i) => i.id_inscripcion)) + 1,
      estado: 'activa',
      fecha_inscripcion: new Date().toISOString(),
      course_id: courseId,
      clases_completadas: 0,
    }
    guardarInscripciones([...inscripciones, nueva])

    return HttpResponse.json(conCurso(nueva), { status: 201 })
  }),

  http.get(RUTA_MIS_INSCRIPCIONES, async ({ request }) => {
    const falla = await simularRed()
    if (falla) return falla
    if (!tieneToken(request)) return sinToken()

    const datos = leerInscripciones()
      .map(conCurso)
      .filter((i) => i !== null)
    return HttpResponse.json({ datos })
  }),

  http.get(RUTA_USUARIOS, async ({ request }) => {
    const falla = await simularRed()
    if (falla) return falla
    if (!tieneToken(request)) return sinToken()

    return HttpResponse.json({ datos: USUARIOS })
  }),

  http.get(RUTA_MIS_CURSOS, async ({ request, params }) => {
    const falla = await simularRed()
    if (falla) return falla
    if (!tieneToken(request)) return sinToken()

    const curso = courses.find((c) => c.slug === params.slug)
    const inscripcion = curso && activaDelCurso(leerInscripciones(), curso.id)
    if (!curso || !inscripcion) return noInscripto()

    const vistas = leerProgreso()[inscripcion.id_inscripcion] ?? []
    const clases: ClaseApi[] = clasesDelCurso(curso).map((clase) => ({
      ...clase,
      completada: vistas.includes(clase.id),
    }))
    return HttpResponse.json({ titulo: curso.titulo, clases })
  }),

  http.post(RUTA_PROGRESO, async ({ request }) => {
    const falla = await simularRed()
    if (falla) return falla
    if (!tieneToken(request)) return sinToken()

    const cuerpo: unknown = await request.json().catch(() => null)
    const idClase =
      typeof cuerpo === 'object' && cuerpo !== null && 'id_clase' in cuerpo
        ? cuerpo.id_clase
        : undefined
    if (typeof idClase !== 'number') {
      return error(400, 'Datos incompletos', 'Falta la clase que querés marcar como vista.')
    }

    const curso = courses.find((c) => clasesDelCurso(c).some((clase) => clase.id === idClase))
    if (!curso) return error(404, 'No encontrado', 'La clase no existe.')

    const inscripciones = leerInscripciones()
    const inscripcion = activaDelCurso(inscripciones, curso.id)
    if (!inscripcion) return noInscripto()

    // Marcarla dos veces no la cuenta dos veces
    const progreso = leerProgreso()
    const vistas = progreso[inscripcion.id_inscripcion] ?? []
    if (!vistas.includes(idClase)) {
      guardarProgreso({ ...progreso, [inscripcion.id_inscripcion]: [...vistas, idClase] })
      // Así el panel (GET /api/enrollments/me) también muestra el avance
      guardarInscripciones(
        inscripciones.map((i) =>
          i === inscripcion
            ? { ...i, clases_completadas: Math.min(curso.cantidad_clases, i.clases_completadas + 1) }
            : i,
        ),
      )
    }

    return HttpResponse.json({ id_clase: idClase, completada: true })
  }),
]
