import { ApiError, pedir } from './apiClient'

// Misma forma que GET /api/cursos del contrato v1 (docs/api/contrato-api-v1.md),
// con adaptación para lo que devuelve hoy GET /api/courses en el backend real.

export type Nivel = 'principiante' | 'inicial' | 'intermedio' | 'avanzado'

export type Instructor = {
  nombre: string
  cargo?: string
}

export type ClaseResumen = {
  id: number
  titulo: string
  orden: number
}

export type Course = {
  id: number
  slug: string
  titulo: string
  resumen: string
  descripcion?: string
  url_portada: string | null
  categoria: string | null
  nivel: Nivel
  cantidad_clases: number
  publicado?: boolean
  // Duración e instructor no están en el contrato v1. Los piden las cards FE-07 
  // y el diseño de UX, así que quedan opcionales hasta que Backend confirme, en el siguiente
  // commit podemos hacerlos obligatorios si se confirma que siempre vienen!
  duracion_semanas?: number
  instructor?: Instructor
  clases?: ClaseResumen[]
}

export const nivelLabel: Record<Nivel, string> = {
  principiante: 'Principiante',
  inicial: 'Inicial',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

// El backend devuelve url_portada bajo el alias "imagen" y resumido en nulo si
// se creó sin ese campo. Lo llevamos a la forma de Course en un solo lugar.
type CursoCrudo = Omit<Course, 'url_portada' | 'resumen'> & {
  url_portada?: string | null
  imagen?: string | null
  resumen?: string | null
}

export function normalizarCurso(crudo: CursoCrudo): Course {
  const { imagen, url_portada, resumen, ...resto } = crudo
  return {
    ...resto,
    resumen: resumen ?? '',
    url_portada: url_portada !== undefined ? url_portada : (imagen ?? null),
  }
}

function extraerLista(respuesta: unknown): CursoCrudo[] {
  if (typeof respuesta !== 'object' || respuesta === null) {
    throw new Error('Respuesta inválida de GET /api/courses')
  }
  if ('datos' in respuesta && Array.isArray(respuesta.datos)) {
    return respuesta.datos as CursoCrudo[]
  }
  if ('data' in respuesta && Array.isArray(respuesta.data)) {
    return respuesta.data as CursoCrudo[]
  }
  throw new Error('Respuesta inválida de GET /api/courses')
}

export function extraerDetalle(respuesta: unknown): CursoCrudo {
  if (typeof respuesta !== 'object' || respuesta === null) {
    throw new Error('Respuesta inválida del detalle de curso')
  }
  if ('data' in respuesta && typeof respuesta.data === 'object' && respuesta.data !== null) {
    return respuesta.data as CursoCrudo
  }
  return respuesta as CursoCrudo
}

export async function obtenerCursos(signal?: AbortSignal): Promise<Course[]> {
  const respuesta = await pedir<unknown>('/api/courses', { signal })
  return extraerLista(respuesta).map(normalizarCurso)
}

// Con MSW responde GET /api/courses/:slug directo. El backend real recibe :id,
// así que si :slug da 404 por no ser numérico, se busca el curso en la lista y
// se pide su detalle por id.
export async function obtenerCurso(slug: string, signal?: AbortSignal): Promise<Course> {
  try {
    const respuesta = await pedir<unknown>(`/api/courses/${encodeURIComponent(slug)}`, { signal })
    return normalizarCurso(extraerDetalle(respuesta))
  } catch (error) {
    if (!(error instanceof ApiError && error.status === 404)) throw error

    const lista = await obtenerCursos(signal)
    const encontrado = lista.find((c) => c.slug === slug || String(c.id) === slug)
    if (!encontrado) throw error

    const detalle = await pedir<unknown>(`/api/courses/${encontrado.id}`, { signal })
    return normalizarCurso(extraerDetalle(detalle))
  }
}

export const courses: Course[] = [
  {
    id: 1,
    slug: 'desarrollo-frontend-react',
    titulo: 'Desarrollo Frontend con React',
    resumen:
      'Creá aplicaciones web completas desde cero: componentes, estado, rutas y deploy, con un proyecto real para tu portfolio.',
    descripcion:
      'En este curso vas a pasar de maquetar pantallas estáticas a construir aplicaciones web reales con React y TypeScript. Recorremos el modelo de componentes, el manejo de estado, el consumo de APIs REST con estados de carga y error, el ruteo con rutas protegidas y el despliegue en producción.',
    url_portada: 'https://picsum.photos/seed/skillup-frontend/640/360',
    categoria: 'Frontend',
    nivel: 'principiante',
    cantidad_clases: 24,
    duracion_semanas: 12,
    instructor: { nombre: 'Lucía Giménez', cargo: 'Staff Engineer' },
    clases: [
      { id: 101, titulo: 'Pensar en componentes y JSX', orden: 1 },
      { id: 102, titulo: 'Props, estado e inmutabilidad', orden: 2 },
      { id: 103, titulo: 'Efectos, fetch y manejo de promesas', orden: 3 },
      { id: 104, titulo: 'React Router y rutas privadas', orden: 4 },
      { id: 105, titulo: 'Formularios, validación y accesibilidad', orden: 5 },
      { id: 106, titulo: 'Build y deploy en producción', orden: 6 },
    ],
  },
  {
    id: 2,
    slug: 'diseno-ux-ui',
    titulo: 'Diseño UX/UI y Design Systems',
    resumen:
      'De la investigación con usuarios hasta Figma avanzado. Construí sistemas de diseño escalables y presentá casos de estudio.',
    descripcion:
      'Un recorrido completo por el proceso de diseño de producto digital: investigación, arquitectura de información, wireframes, prototipos interactivos y construcción de un sistema de diseño con tokens, componentes y criterios de accesibilidad WCAG AA.',
    url_portada: 'https://picsum.photos/seed/skillup-ux/640/360',
    categoria: 'Diseño UX/UI',
    nivel: 'principiante',
    cantidad_clases: 18,
    duracion_semanas: 10,
    instructor: { nombre: 'Matías Rossi', cargo: 'Product Designer' },
    clases: [
      { id: 201, titulo: 'Investigación con usuarios y mapa de empatía', orden: 1 },
      { id: 202, titulo: 'Flujos de usuario y arquitectura de información', orden: 2 },
      { id: 203, titulo: 'Tokens de color, tipografía y contraste WCAG', orden: 3 },
      { id: 204, titulo: 'Componentes reutilizables y variantes en Figma', orden: 4 },
      { id: 205, titulo: 'Pruebas de usabilidad y handoff a desarrollo', orden: 5 },
    ],
  },
  {
    id: 3,
    slug: 'backend-node',
    titulo: 'Backend con Node.js y Express',
    resumen:
      'APIs REST, autenticación con JWT y bases de datos SQL, desplegadas en la nube con buenas prácticas.',
    descripcion:
      'Aprendé a diseñar y construir el servidor detrás de una aplicación moderna. Armamos una API REST con arquitectura MVC, autenticación con JWT, control de permisos por rol y persistencia en PostgreSQL.',
    url_portada: 'https://picsum.photos/seed/skillup-backend/640/360',
    categoria: 'Backend',
    nivel: 'intermedio',
    cantidad_clases: 28,
    duracion_semanas: 14,
    instructor: { nombre: 'Tomás Fernández', cargo: 'Cloud Architect' },
    clases: [
      { id: 301, titulo: 'Arquitectura HTTP, rutas y middlewares en Express', orden: 1 },
      { id: 302, titulo: 'Modelado relacional y consultas con PostgreSQL', orden: 2 },
      { id: 303, titulo: 'Registro, hash de contraseñas y login con JWT', orden: 3 },
      { id: 304, titulo: 'Autorización por roles y manejo consistente de errores', orden: 4 },
      { id: 305, titulo: 'Pruebas con Postman y despliegue del servidor', orden: 5 },
    ],
  },
  // Los tres que siguen prueban los casos raros que pide FE-07
  {
    id: 4,
    slug: 'analisis-de-datos',
    titulo:
      'Análisis de datos con Python, SQL y Power BI para la toma de decisiones en equipos de producto',
    resumen:
      'Limpieza de datos, consultas, visualizaciones y dashboards que responden preguntas reales del negocio.',
    descripcion:
      'Definí métricas accionables, diseñá el seguimiento de eventos de un producto digital y transformá datos crudos en tableros claros para acompañar las decisiones del equipo.',
    url_portada: 'https://picsum.photos/seed/skillup-data/640/360',
    categoria: 'Data Analytics',
    nivel: 'intermedio',
    cantidad_clases: 20,
    duracion_semanas: 8,
    instructor: { nombre: 'Carla Méndez' },
    clases: [
      { id: 401, titulo: 'Definición de KPIs y embudos de conversión', orden: 1 },
      { id: 402, titulo: 'Consultas SQL sobre el modelo de negocio', orden: 2 },
      { id: 403, titulo: 'Diccionario de datos y eventos de telemetría', orden: 3 },
      { id: 404, titulo: 'Armado de tableros y lectura de desvíos', orden: 4 },
    ],
  },
  {
    id: 5,
    slug: 'product-management',
    titulo: 'Product Management',
    resumen:
      'Descubrimiento, priorización y métricas. Aprendé a llevar un producto de la idea al lanzamiento.',
    descripcion:
      'Cómo coordinar diseño, ingeniería y negocio alrededor de un problema real: recortar un MVP, escribir historias claras, priorizar el backlog y medir el impacto de cada entrega.',
    url_portada: null,
    categoria: 'Producto',
    nivel: 'principiante',
    cantidad_clases: 16,
    duracion_semanas: 6,
    instructor: { nombre: 'Diego Paz', cargo: 'Head of Product' },
    clases: [
      { id: 501, titulo: 'Problema, hipótesis y recorte de MVP', orden: 1 },
      { id: 502, titulo: 'User journeys, alcance y criterios de aceptación', orden: 2 },
      { id: 503, titulo: 'Priorización del backlog y trabajo entre áreas', orden: 3 },
      { id: 504, titulo: 'Métricas de éxito e iteración post-lanzamiento', orden: 4 },
    ],
  },
  {
    id: 6,
    slug: 'inteligencia-artificial',
    titulo: 'Inteligencia Artificial aplicada',
    resumen:
      'Modelos de lenguaje, embeddings y automatizaciones con IA integradas a aplicaciones web.',
    descripcion:
      'Integrá modelos de lenguaje en productos reales cuidando costos, latencia y calidad de respuesta. Incluye diseño de prompts, salidas estructuradas, búsqueda semántica y evaluación.',
    url_portada: 'https://picsum.photos/seed/skillup-ia/640/360',
    categoria: 'Inteligencia Artificial',
    nivel: 'avanzado',
    cantidad_clases: 22,
    clases: [
      { id: 601, titulo: 'APIs de modelos de lenguaje y salidas estructuradas', orden: 1 },
      { id: 602, titulo: 'Embeddings y búsqueda sobre documentos propios', orden: 2 },
      { id: 603, titulo: 'Evaluación de respuestas, límites y seguridad', orden: 3 },
    ],
  },
  // Copia la forma del curso real del backend: sin categoría y sin clases cargadas
  {
    id: 7,
    slug: 'nodejs-express-desde-cero',
    titulo: 'Node.js y Express desde cero',
    resumen: 'Curso recién creado que todavía no tiene categoría ni clases.',
    url_portada: null,
    categoria: null,
    nivel: 'principiante',
    cantidad_clases: 0,
  },
]