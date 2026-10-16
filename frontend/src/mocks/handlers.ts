import { delay, http, HttpResponse } from 'msw'
import { courses } from '../lib/courses'
import type { Inscripcion } from '../lib/inscripciones'

// Simula las rutas del brief que el backend todavía no tiene. Solo corre en
// desarrollo con VITE_MOCKS=true (ver main.tsx). Lo que no está acá, como login
// y registro, sigue yendo al backend real.

// Las rutas empiezan con * para que coincidan con cualquier VITE_API_URL
const RUTA_CURSOS = '*/api/courses'
const RUTA_INSCRIPCIONES = '*/api/enrollments'
const RUTA_MIS_INSCRIPCIONES = '*/api/enrollments/me'

const CLAVE_INSCRIPCIONES = 'skillup.mock.inscripciones'
// "500" hace fallar todos los pedidos; "lento" los demora 3 segundos
const CLAVE_FORZAR = 'skillup.mock.forzar'

const DEMORA = 600
const DEMORA_LENTA = 3000

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

// Une la inscripción guardada con su curso. null si el curso ya no existe.
function conCurso({ course_id, ...inscripcion }: InscripcionGuardada): Inscripcion | null {
  const curso = courses.find((c) => c.id === course_id)
  if (!curso) return null
  const { id, slug, titulo, url_portada, cantidad_clases } = curso
  return { ...inscripcion, curso: { id, slug, titulo, url_portada, cantidad_clases } }
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
]
