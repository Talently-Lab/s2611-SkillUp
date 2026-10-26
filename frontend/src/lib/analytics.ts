import { ApiError } from './apiClient'
import { leerSesion } from './sesion'

// Telemetría con Google Analytics 4 (GA4).
// Los eventos y sus parámetros son los que se definieron desde Data Analytics
// en las semanas previas (de la 1 hasta la actual).

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

const ID_MEDICION = import.meta.env.VITE_GA_ID as string | undefined

type Parametros = Record<string, string | number | undefined>

// Carga GA4. Sin VITE_GA_ID no se envían datos a GA4, debemos poner esto en 
// el deploy del frontend (actualmente vercel, si no me equivoco).
export function iniciarAnalitica() {
  if (!ID_MEDICION || window.gtag) return
  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() { // gtag necesita recibir el objeto arguments, no un array
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments)
  }
  window.gtag('js', new Date())
  // Con debug_mode los eventos se ven en vivo en GA4 > DebugView mientras desarrollamos
  window.gtag('config', ID_MEDICION, { debug_mode: import.meta.env.DEV })

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${ID_MEDICION}`
  document.head.appendChild(script)
}

// undefined al arrancar, para que la primera vez siempre se configure:
let usuarioConfigurado: number | null | undefined

// Según la matriz de Data, el user_id no viaja como parámetro del evento: se
// configura en GA4 cuando cambia la sesión (login o logout)
function sincronizarUsuario() {
  const id = leerSesion()?.usuario.id ?? null
  if (id === usuarioConfigurado) return
  usuarioConfigurado = id
  window.gtag?.('set', { user_id: id })
}

export function registrarEvento(nombre: string, parametros: Parametros = {}) {
  if (!window.gtag) return
  sincronizarUsuario()
  window.gtag('event', nombre, parametros)
}

// Para los eventos de vista, que Data pide contar una sola vez por visita.
// sessionStorage dura mientras la pestaña está abierta
export function registrarVistaUnaVez(nombre: string, parametros: Parametros = {}, clave = nombre) {
  const llave = `skillup.ga4.${clave}`
  try {
    if (sessionStorage.getItem(llave)) return
    sessionStorage.setItem(llave, '1')
  } catch {
    // Sin sessionStorage se registra igual
  }
  registrarEvento(nombre, parametros)
}

// Pasa un error de la API al error_type de las matrices de Data. porEstado tiene
// los códigos propios de cada flujo: el 409 es correo_duplicado en el registro y
// ya_inscripto en la inscripción
export function tipoDeError(error: unknown, porEstado: Partial<Record<number, string>>) {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'sin_conexion'
    const propio = porEstado[error.status]
    if (propio) return propio
  }
  return 'error_servidor'
}

// Los parámetros de curso que comparten el catálogo, el detalle y la inscripción.
// category y level van con los valores de la API, en minúscula
export function datosDeCurso(curso: { id: number; slug?: string; categoria?: string | null }) {
  return { course_id: curso.id, course_slug: curso.slug, category: curso.categoria ?? undefined }
}
