# Relevamiento de Frontend — SkillUp Campus

**Semana 1 · Rol Frontend**
Entregable: listado definitivo de vistas y componentes a desarrollar.

---

## 1. Mapa de rutas

14 rutas en total. Las cinco de admin son las que hay que proteger: la protección
no puede vivir solo en el menú, porque si un alumno escribe la URL a mano tiene
que rebotar igual.

| Ruta | Vista | Acceso | Nota |
|---|---|---|---|
| `/` | Home | Pública | Hero, cursos destacados, CTA a registro. Copy de Marketing. |
| `/cursos` | Catálogo | Pública | Grilla de tarjetas, búsqueda y filtro por categoría. |
| `/cursos/:slug` | Detalle de curso | Pública | Botón inscribirse. Sin sesión manda a login y vuelve acá. |
| `/login` | Login | Pública | Si ya hay token válido, redirige al dashboard. |
| `/registro` | Registro | Pública | Alta solo de rol alumno. El admin se crea por seed en el back. |
| `/mis-cursos` | Dashboard alumno | Alumno | Entregable obligatorio del rol. |
| `/mis-cursos/:slug` | Curso inscripto | Alumno | Listado de clases. Sin video, según alcance del MVP. |
| `/perfil` | Perfil | Alumno | Datos básicos y cerrar sesión. Cortable si falta tiempo. |
| `/admin` | Redirección | Admin | Manda a `/admin/cursos`. |
| `/admin/cursos` | Listado admin | Admin | Tabla con crear, editar y borrar. |
| `/admin/cursos/nuevo` | Alta de curso | Admin | Mismo componente que la edición, sin valores iniciales. |
| `/admin/cursos/:id/editar` | Edición de curso | Admin | Separada del alta a propósito: sin usar "nuevo" como id mágico. |
| `/admin/usuarios` | Usuarios admin | Admin | Listado, cambio de rol, baja. Sin alta manual. |
| `*` | 404 | Pública | Barata de hacer y QA la va a buscar. |

### Fuera de alcance, a propósito

Para que no se reporte como faltante:

- **Recuperar contraseña.** El brief deja las notificaciones automáticas por email
  fuera de alcance, y sin email no hay recuperación posible.
- **Términos y privacidad.** No están en el MVP.
- **Detalle de usuario en el admin.** El brief pide gestión básica: listar, cambiar
  rol y dar de baja. Todo se resuelve en la misma tabla.
- **Pantalla de permiso denegado.** Un alumno que entre a `/admin` se redirige al
  home. Una pantalla de 403 no justifica una ruta más en un MVP de ocho semanas.

### Dependencia abierta

Las rutas de curso usan `:slug`. Si la API termina devolviendo solo `id` y no
`slug`, cambian dos rutas. Está pendiente en TEC-01, el contrato de API.

---

## 2. Vistas en detalle

Para cada una, los componentes que consume y los estados que hay que dibujar. Los
estados son la mitad del trabajo y son lo que se olvida: una vista que solo existe
en su versión feliz se cae en la demo.

### Catálogo · `/cursos`

- **Componentes:** AppLayout, CourseFilters, CourseGrid, CourseCard, EmptyState, Skeleton
- **Estados:** cargando (skeletons, no un spinner solo) · sin resultados de búsqueda ·
  error de red con botón reintentar
- **Depende de:** `GET /courses` con paginación y filtro por categoría

### Detalle de curso · `/cursos/:slug`

- **Componentes:** AppLayout, Badge (nivel, categoría), Avatar del instructor,
  LessonList, EnrollButton, Toast
- **Estados:** visitante sin sesión · alumno no inscripto · alumno ya inscripto
  (el botón pasa a "Ir al curso") · curso inexistente → 404
- **Depende de:** `GET /courses/:slug` y `POST /enrollments`

### Login y Registro · `/login` y `/registro`

- **Componentes:** AuthLayout, FormField, Input, Button en loading, Alert
- **Estados:** validación en cliente antes de llamar a la API · credenciales
  inválidas (mensaje genérico, nunca "el mail no existe") · email ya registrado ·
  envío en curso con el botón bloqueado
- **Depende de:** `POST /auth/login` y `POST /auth/register`

### Dashboard del alumno · `/mis-cursos`

- **Componentes:** AppLayout, CourseGrid, CourseCard con pie de progreso,
  EmptyState con CTA al catálogo
- **Estados:** sin inscripciones (es el estado del primer día, no puede quedar
  vacío) · cargando · token vencido → logout y aviso
- **Depende de:** `GET /me/enrollments`

### Panel admin de cursos · `/admin/cursos`

- **Componentes:** AdminLayout, Table, CoursesTable, Button danger, ConfirmDialog,
  CourseForm, Toast
- **Estados:** tabla vacía · borrado pidiendo confirmación · guardado con error de
  validación campo por campo · rol alumno entrando por URL → redirige, no muestra
  la tabla en gris

---

## 3. Inventario de componentes

35 piezas en cinco capas. Un componente se justifica si aparece en dos lugares o
más, si encierra lógica que no querés escribir dos veces, o si UX lo va a
especificar en el UI Kit. Lo que no cumple ninguna de las tres es una clase de
Tailwind, no un archivo.

**Prioridad:** P0 = sin esto no hay entrega · P1 = hace que se vea terminado ·
P2 = cortable si vamos ajustados. Son 17 P0, 14 P1 y 4 P2.

### Primitivos (8)

Se usan en todas las pantallas, así que son los primeros y los que más cuesta
cambiar después.

| Componente | Prioridad | Detalle |
|---|---|---|
| Button | P0 | primary, secondary, ghost, danger · loading · disabled · puede renderizar como Link |
| Input | P0 | text, email, password con el ojito adentro |
| FormField | P0 | envuelve label, hint y error, y conecta el id con el input |
| Select | P1 | filtro de categoría, nivel del curso, rol de usuario |
| Textarea | P1 | descripción del curso en el admin |
| Badge | P1 | nivel, categoría, rol, estado de inscripción |
| Spinner | P1 | vive adentro del Button en loading |
| Skeleton | P1 | uno base, con forma de card y de fila de tabla |

### Feedback y overlay (6)

Parecen decoración y no lo son. Un modal accesible es foco atrapado, cierre con
Escape, scroll bloqueado y aria correcto. Se escribe una vez.

| Componente | Prioridad | Detalle |
|---|---|---|
| Modal | P0 | base con portal, foco atrapado y cierre con Escape |
| ConfirmDialog | P0 | sobre Modal. Borrar curso y dar de baja usuario |
| Toast | P0 | con su provider. Inscribirse, crear, editar, borrar, cambiar rol |
| Alert | P1 | error que vive en el flujo, no flotando |
| EmptyState | P1 | catálogo sin resultados, dashboard sin inscripciones, tabla vacía |
| ErrorBoundary | P2 | una hora de trabajo que evita la pantalla en blanco en la demo |

### Layout y navegación (6)

Tres esqueletos distintos, no uno con condicionales.

| Componente | Prioridad | Detalle |
|---|---|---|
| AppLayout | P0 | navbar, main y footer. Rutas públicas y de alumno |
| Navbar | P0 | uno solo que cambia según sesión y rol. No tres navbars |
| AuthLayout | P1 | centrado, sin navegación. Login y registro |
| AdminLayout | P1 | tabs entre cursos y usuarios. Tabs, no sidebar: menos código |
| UserMenu | P1 | avatar, perfil y cerrar sesión |
| Footer | P2 | links y marca |

### Dominio (11)

Acá está el valor real del proyecto, y acá está el componente más importante de
los 35: **EnrollButton**. No es un botón, es todo el flujo de inscripción en un
solo lugar. Decide si hay sesión, si ya estás inscripto, llama a la API, maneja el
loading, dispara el toast y, sin sesión, manda a login recordando a dónde volver.
Es el flujo que QA va a testear y el que Data va a medir.

| Componente | Prioridad | Detalle |
|---|---|---|
| CourseCard | P0 | uno solo, con el pie intercambiable (ver decisión 1) |
| CourseGrid | P0 | la grilla más sus estados: skeletons si carga, EmptyState si no hay nada |
| EnrollButton | P0 | el flujo de inscripción entero |
| CourseForm | P0 | uno para alta y edición, con initialValues |
| Table | P0 | primitiva: estilos, cabecera, estado de carga y vacío |
| CoursesTable | P0 | columnas concretas y acciones por fila |
| CourseFilters | P1 | buscador con debounce y filtros, sincronizados con la URL |
| LessonList | P1 | temario. Solo lectura en el detalle, con estado en el curso inscripto |
| UsersTable | P1 | columnas propias, cambio de rol en línea |
| Avatar | P1 | imagen o iniciales. Navbar, instructor, tabla de usuarios |
| Pagination | P2 | con pocos cursos de prueba no se nota |

### Sin interfaz (4)

No se ven en ninguna pantalla y son dos de los tres entregables obligatorios del
rol. Son también las que no aparecen en ningún tablero porque nadie las nombra.

| Pieza | Prioridad | Detalle |
|---|---|---|
| AuthProvider | P0 | token, usuario, rol, persistencia y rehidratación al recargar |
| ProtectedRoute | P0 | uno solo, con prop de rol opcional |
| apiClient | P0 | baseURL, header Authorization y 401 manejado en un solo lugar |
| ScrollToTop | P2 | diez líneas. Sin esto, cambiás de ruta y quedás a mitad de página |

---

## 4. Decisiones tomadas

**1. CourseCard y EnrolledCourseCard son un solo componente.** Comparten imagen,
título, badges e instructor, y solo cambian en el pie y en a dónde linkean. Un
`CourseCard` con una prop `footer`. La alternativa mala no es tener dos archivos,
es tener uno con ocho props booleanas que nadie entiende en la semana 6.

**2. Nada de DataTable genérica.** Hay dos tablas en todo el proyecto. Una tabla
genérica con render de columnas es más código y más difícil de leer que las dos
concretas. `Table` primitiva con los estilos, y `CoursesTable` y `UsersTable`
aparte. La abstracción se hace al tercer uso, no al primero.

**3. Un solo formulario de curso.** `CourseForm` recibe `initialValues` y
`onSubmit`, y la ruta decide si viene vacío o cargado. Dos formularios para los
mismos ocho campos es el error más caro de la lista, porque cuando se agregue un
campo hay que acordarse de los dos.

**4. TanStack Query para los fetch.** Evita escribir seis o siete hooks con su
loading, su error y su refetch, que es donde se va el tiempo en un proyecto así.

---

## 5. Lo que no hay que construir

Cada componente que no se escribe es tiempo que va a las rutas privadas.

| No hacer | Por qué |
|---|---|
| `Container` | es `max-w-6xl mx-auto px-4`. Una clase, no un archivo |
| `Card` genérico | cada tarjeta de esta app tiene contenido distinto |
| `Grid` / `Row` / `Col` | Tailwind ya es eso |
| `Icon` wrapper | importar los íconos de la librería directo |
| `SearchInput` suelto | vive adentro de CourseFilters, no se usa en otro lado |
| `Header` + `Navbar` | son la misma cosa con dos nombres |
| `RoleRoute` | es ProtectedRoute con una prop más |

---

## 6. Contrato de la tarjeta de curso

Propuesta para acordar con Backend. Está cargada como TEC-01 en el tablero.

```
GET /courses  ->  { data: Course[], page, totalPages }

Course:
{
  "id": "c_014",
  "slug": "react-desde-cero",
  "title": "React desde cero",
  "summary": "Texto corto de tarjeta, maximo 120 caracteres",
  "coverUrl": "https://.../react.jpg",
  "category": "Desarrollo web",
  "level": "principiante",
  "durationHours": 12,
  "lessonsCount": 24,
  "instructor": { "name": "Ana Ruiz", "avatarUrl": "..." },
  "isEnrolled": false,
  "createdAt": "2026-09-01T12:00:00Z"
}
```

Pendiente de definir con Backend: qué devuelve el login y dónde viaja el rol,
duración del token y manejo del 401, formato único de error, forma de la
paginación, URL del mock, CORS, y si `isEnrolled` viene en el catálogo o se pide
aparte.

---

## 7. Tokens de marca

De la guía de estilo entregada por Diseño.

| Token | Valor | Uso |
|---|---|---|
| primary | `#FC703C` | naranja. Fondo de botones y acentos |
| primary-soft | `#FFA175` | durazno. Fondos suaves y hover |
| ink | `#5D0703` | cherry. Títulos y texto |
| surface | `#FFFFFF` | fondo base |
| cream | `#F4F3E6` | fondo alterno de secciones |

Tipografías: **Poppins** para títulos, **DM Sans** para cuerpo.

### Contraste medido (WCAG AA pide 4.5:1 para texto normal)

| Combinación | Contraste | Veredicto |
|---|---|---|
| blanco sobre naranja | 2.79:1 | no usar |
| blanco sobre durazno | 1.98:1 | no usar |
| naranja sobre crema | 2.50:1 | no usar |
| cherry sobre naranja | 5.02:1 | pasa |
| cherry sobre durazno | 7.08:1 | pasa |
| cherry sobre crema | 12.56:1 | pasa |
| cherry sobre blanco | 14.03:1 | pasa |

**Regla:** el botón primario va con fondo naranja y texto cherry, nunca blanco. El
naranja no se usa para texto sobre fondos claros, solo como fondo o borde. El
cherry es el único color de texto seguro de toda la app.

### Falta definir

La paleta es de marca, no de interfaz. Faltan: grises de borde, color de texto
secundario, error, éxito y alerta, estado disabled y color del anillo de foco.
Cargado como FE-02b.

---

## 8. Backlog técnico

20 tarjetas cargadas en el tablero.

| Código | Tarjeta |
|---|---|
| TEC-01 | Contrato de API v1 (Front + Back) |
| FE-01 | Setup del proyecto React + Vite |
| FE-02 | Configurar Tailwind con los tokens de marca |
| FE-02b | Aplicar el UI Kit y completar los tokens faltantes |
| FE-03 | Router con las 14 rutas y los 3 layouts |
| FE-04 | Deploy en Vercel con preview por rama |
| FE-05 | apiClient con baseURL y manejo de token |
| FE-06 | Primitivos: Button, Input, FormField y Badge |
| FE-07 | CourseCard y CourseGrid |
| FE-08 | Catálogo con búsqueda y filtros |
| FE-09 | Detalle de curso |
| FE-10 | Home con cursos destacados |
| FE-11 | Login y Registro con validación |
| FE-12 | AuthProvider: sesión, rol y persistencia |
| FE-13 | ProtectedRoute por token y por rol |
| FE-14 | EnrollButton: flujo de inscripción completo |
| FE-15 | Dashboard del alumno |
| FE-16 | CRUD de cursos en el panel admin |
| FE-17 | Listado de usuarios admin |
| FE-18 | Responsive, accesibilidad y README final |
