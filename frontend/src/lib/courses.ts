// Misma forma que GET /api/cursos del contrato v1 (docs/api/contrato-api-v1.md),
// para que el día que llegue la API solo cambie de dónde salen los datos.

export type Nivel = 'principiante' | 'intermedio' | 'avanzado'

export type Instructor = {
  nombre: string
  cargo?: string
}

export type Course = {
  id: number
  slug: string
  titulo: string
  resumen: string
  url_portada: string | null
  categoria: string
  nivel: Nivel
  cantidad_clases: number
  // Duración e instructor no están en el contrato v1. Los piden FE-07 y el
  // diseño de UX, así que quedan opcionales hasta que Backend confirme.
  duracion_semanas?: number
  instructor?: Instructor
}

export const nivelLabel: Record<Nivel, string> = {
  principiante: 'Principiante',
  intermedio: 'Intermedio',
  avanzado: 'Avanzado',
}

export const courses: Course[] = [
  {
    id: 1,
    slug: 'desarrollo-frontend-react',
    titulo: 'Desarrollo Frontend con React',
    resumen:
      'Creá aplicaciones web completas desde cero: componentes, estado, rutas y deploy, con un proyecto real para tu portfolio.',
    url_portada: 'https://picsum.photos/seed/skillup-frontend/640/360',
    categoria: 'Frontend',
    nivel: 'principiante',
    cantidad_clases: 24,
    duracion_semanas: 12,
    instructor: { nombre: 'Lucía Giménez', cargo: 'Staff Engineer' },
  },
  {
    id: 2,
    slug: 'diseno-ux-ui',
    titulo: 'Diseño UX/UI y Design Systems',
    resumen:
      'De la investigación con usuarios hasta Figma avanzado. Construí sistemas de diseño escalables y presentá casos de estudio.',
    url_portada: 'https://picsum.photos/seed/skillup-ux/640/360',
    categoria: 'Diseño UX/UI',
    nivel: 'principiante',
    cantidad_clases: 18,
    duracion_semanas: 10,
    instructor: { nombre: 'Matías Rossi', cargo: 'Product Designer' },
  },
  {
    id: 3,
    slug: 'backend-node',
    titulo: 'Backend con Node.js y Express',
    resumen:
      'APIs REST, autenticación con JWT y bases de datos SQL, desplegadas en la nube con buenas prácticas.',
    url_portada: 'https://picsum.photos/seed/skillup-backend/640/360',
    categoria: 'Backend',
    nivel: 'intermedio',
    cantidad_clases: 28,
    duracion_semanas: 14,
    instructor: { nombre: 'Tomás Fernández', cargo: 'Cloud Architect' },
  },
  // Los tres que siguen prueban los casos raros que pide FE-07
  {
    id: 4,
    slug: 'analisis-de-datos',
    titulo:
      'Análisis de datos con Python, SQL y Power BI para la toma de decisiones en equipos de producto',
    resumen:
      'Limpieza de datos, consultas, visualizaciones y dashboards que responden preguntas reales del negocio.',
    url_portada: 'https://picsum.photos/seed/skillup-data/640/360',
    categoria: 'Data Analytics',
    nivel: 'intermedio',
    cantidad_clases: 20,
    duracion_semanas: 8,
    instructor: { nombre: 'Carla Méndez' },
  },
  {
    id: 5,
    slug: 'product-management',
    titulo: 'Product Management',
    resumen:
      'Descubrimiento, priorización y métricas. Aprendé a llevar un producto de la idea al lanzamiento.',
    url_portada: null,
    categoria: 'Producto',
    nivel: 'principiante',
    cantidad_clases: 16,
    duracion_semanas: 6,
    instructor: { nombre: 'Diego Paz', cargo: 'Head of Product' },
  },
  {
    id: 6,
    slug: 'inteligencia-artificial',
    titulo: 'Inteligencia Artificial aplicada',
    resumen:
      'Modelos de lenguaje, embeddings y automatizaciones con IA integradas a aplicaciones web.',
    url_portada: 'https://picsum.photos/seed/skillup-ia/640/360',
    categoria: 'Inteligencia Artificial',
    nivel: 'avanzado',
    cantidad_clases: 22,
  },
]