# SkillUp Campus · Frontend

Aplicación web de SkillUp Campus: catálogo de cursos de IT, inscripción y seguimiento del avance de cada alumno, con un panel para administrar cursos.

**Sitio:** https://skillup-campus.vercel.app

## Funcionalidades

**Visitantes**
- Inicio con cursos destacados.
- Catálogo con buscador y filtros por categoría y nivel.
- Detalle de cada curso.

**Alumnos**
- Registro e inicio de sesión.
- Inscripción a un curso desde su detalle.
- Mis cursos: los cursos inscriptos con su barra de progreso.
- Página del curso con sus clases y progreso; marcar clases como vistas depende de dos endpoints que el backend todavía no tiene (ver Estado y pendientes).

**Administradores**
- Cursos: crear, editar y eliminar (con confirmación antes de borrar).
- Listado de usuarios.

**Kit de componentes**
- En `/ui` se ven los componentes base de la interfaz: `Button`, `Badge`, `ConfirmDialog`, `Input` y `FormField`.

## Stack

Versiones según `package.json`:

| Herramienta | Versión |
|---|---|
| React | 19.2 |
| Vite | 8.3 |
| TypeScript | 6.0 |
| Tailwind CSS | 4.3 |
| React Router | 7.18 |
| zod | 4.6 |
| MSW | 2.15 |

El lint corre con oxlint.

## Decisiones técnicas

- **Cliente de API central.** Todos los pedidos pasan por `src/lib/apiClient.ts`, que agrega el token y convierte los errores de red y las respuestas con error en un `ApiError`. Las respuestas de inscripciones, clases y usuarios se validan con zod; las de cursos se normalizan a mano en `src/lib/courses.ts`, porque el backend todavía no responde con la forma del contrato. Los nombres de campos del backend quedan dentro de `src/lib/`: si Backend los cambia, no se tocan las pantallas.
- **Contrato de API con Backend.** `docs/api/contrato-api-v1.md` define rutas, campos y errores. Cada punto indica si está confirmado, si es lo que hace hoy el backend o si sigue a confirmar.
- **MSW para no depender del back.** Con `VITE_MOCKS=true`, las rutas que el backend todavía no tiene se responden desde `src/mocks/handlers.ts`.
- **Rutas protegidas.** `RutaProtegida` pide sesión para Mis cursos y rol `admin` para `/admin`; un alumno nunca llega a ver el panel. Login y registro solo se muestran sin sesión.
- **Estados de carga, error y vacío.** Cada pantalla que pide datos los contempla. Los textos son de Marketing; los que todavía no confirmó están marcados como provisorios en el código.
- **Accesibilidad.** El foco se mueve a los avisos después de una acción, los mensajes usan `role="alert"` y `role="status"`, el contraste de los colores está medido contra los fondos (ver `src/index.css`) y los controles tienen foco visible para usarlos con teclado.
- **Tokens de diseño.** Los colores de la marca se definen una vez en `@theme` de `src/index.css` y se usan como clases de Tailwind (`bg-primary`, `text-ink`, `bg-cream`).

## Cómo correrlo

**Requisitos:** Node.js `^20.19.0` o `>=22.12.0` (lo que pide Vite 8) y npm.

```bash
npm install
cp .env.example .env
npm run dev
```

Variables de `.env`:

| Variable | Para qué sirve |
|---|---|
| `VITE_API_URL` | URL del backend, sin `/api` al final. En local: `http://localhost:4000`. |
| `VITE_MOCKS` | `true` simula con MSW cursos, inscripciones, usuarios, clases y progreso. Solo funciona con `npm run dev`; login y registro siempre van al backend real. |
| `VITE_GA_ID` | ID de medición de Google Analytics 4. Si queda vacío, la app funciona igual pero no envía eventos. |

Con los mocks activos, guardar `skillup.mock.forzar` en localStorage con el valor `500` hace fallar todos los pedidos, y con `lento` los demora 3 segundos. Sirve para ver los estados de error y de carga.

Otros comandos:

```bash
npm run build   # chequea tipos y genera dist/
npm run lint    # oxlint
```

## Estructura de `src/`

```text
src/
├── assets/       imágenes que importa el código
├── components/   componentes por área: admin, auth, course, dev, layout y ui
├── context/      sesión del usuario (AuthProvider)
├── hooks/        lógica de datos y de sesión reutilizable
├── layouts/      estructura de página pública, de admin y de login/registro
├── lib/          cliente de API, llamadas por recurso, sesión y analítica
├── mocks/        handlers de MSW
├── pages/        una página por ruta
├── router.tsx    definición de rutas
└── main.tsx      punto de entrada: analítica, mocks y render
```

## Estado y pendientes

- **Página del curso:** está lista, pero las clases dependen de `GET /api/mis-cursos/:slug` y `POST /api/progreso`, que el backend todavía no implementa. Con los mocks funciona completa; con el backend real muestra el aviso "Las clases de este curso todavía no están cargadas."
- **Perfil:** se cortó del MVP.

## Cuentas de prueba

- **Alumno:** registrate en el sitio.
- **Admin:** pedile los datos al equipo.

## Equipo de Frontend

- Daniela Homobono · [LinkedIn](https://www.linkedin.com/in/daniela-homobono/)
- Matías Valenzuela
