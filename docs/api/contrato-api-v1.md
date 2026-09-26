# Contrato de API v1 — SkillUp Campus

**Estado:** propuesta del Frontend, a confirmar con Backend.
**Base de referencia:** el DER de la rama `backend-esquema-db`.

Los nombres de campo siguen el castellano que ya usa la base de datos. Lo que está
marcado como **propuesto** todavía no existe en el esquema y el Frontend lo
necesita para el catálogo.

---

## Convenciones generales

**Prefijo:** todas las rutas cuelgan de `/api`.

**Puerto en desarrollo:** el backend corre en `4000`. En el frontend,
`VITE_API_URL=http://localhost:4000`.

**Autenticación:** token JWT en el header `Authorization: Bearer <token>`.

**Formato de error.** Uno solo para toda la API:

```json
{
  "error": {
    "mensaje": "Texto para mostrarle al usuario",
    "campos": {
      "correo": "Este correo ya está registrado"
    }
  }
}
```

`campos` es opcional y solo aparece en errores de validación. Con eso el frontend
marca el error debajo del input que corresponde, en vez de un cartel genérico.

**Paginación.** Query params `?pagina=1&limite=12`. La respuesta trae:

```json
{ "datos": [], "pagina": 1, "totalPaginas": 5, "total": 54 }
```

**Códigos que el frontend maneja distinto:**

| Código | Qué hace el frontend |
|---|---|
| 401 | Limpia la sesión y redirige a login |
| 403 | Redirige al home (usuario logueado sin permiso) |
| 404 | Muestra la pantalla de no encontrado |
| 422 | Pinta los errores por campo usando `error.campos` |

---

## Autenticación

### `POST /api/auth/registro`

Registro simplificado, como pide UX: solo correo y contraseña. Los datos
personales se completan después desde el perfil.

Envía:

```json
{ "correo": "ana@mail.com", "contrasena": "12345678" }
```

Devuelve `201` con el mismo cuerpo que el login.

### `POST /api/auth/login`

Envía:

```json
{ "correo": "ana@mail.com", "contrasena": "12345678" }
```

Devuelve:

```json
{
  "token": "eyJhbGciOi...",
  "usuario": {
    "id": 14,
    "correo": "ana@mail.com",
    "rol": "alumno",
    "nombre": "Ana"
  }
}
```

**A confirmar:** que venga el objeto `usuario` junto al token. Si el rol viaja
solo dentro del JWT, el frontend tiene que decodificarlo, y prefiero no depender
de eso. Es más simple que el backend lo devuelva explícito.

**A confirmar:** los valores exactos de `rol`. La propuesta es `"alumno"` y
`"admin"`.

**A confirmar:** cuánto dura el token y si hay refresh. Si no hay, ante un 401 el
frontend cierra sesión y manda a login.

**Credenciales inválidas:** siempre el mismo mensaje, sin distinguir si el correo
existe o si falló la contraseña.

---

## Cursos (público)

### `GET /api/cursos`

Query params: `pagina`, `limite`, `categoria`, `nivel`, `buscar`.

Devuelve una lista paginada de cursos:

```json
{
  "datos": [
    {
      "id": 14,
      "slug": "react-desde-cero",
      "titulo": "React desde cero",
      "resumen": "Texto corto para la tarjeta, máximo 120 caracteres",
      "url_portada": "https://.../react.jpg",
      "categoria": "Desarrollo web",
      "nivel": "principiante",
      "cantidad_clases": 24,
      "publicado": true,
      "inscripto": false,
      "creado_en": "2026-09-01T12:00:00Z"
    }
  ],
  "pagina": 1,
  "totalPaginas": 5,
  "total": 54
}
```

**Campos propuestos que faltan en la tabla `CURSOS`:**

| Campo | Para qué lo necesita el Frontend |
|---|---|
| `slug` | La URL del detalle es `/cursos/react-desde-cero`, no `/cursos/14` |
| `nivel` | UX lo pide textual en el journey: "nivel de dificultad visible" |
| `categoria` | Sin esto no hay filtro en el catálogo, y el filtro está en el alcance |
| `url_portada` | La imagen de la tarjeta |
| `resumen` | Texto corto de dos líneas. Cortar `descripcion` a la mitad queda mal |

**Valores propuestos para `nivel`:** `"principiante"`, `"intermedio"`,
`"avanzado"`.

**`cantidad_clases`** se puede calcular contando las filas de `CLASES`, no hace
falta guardarlo.

**`inscripto`** solo aparece cuando la petición viaja con token. Si es más simple
no incluirlo, el frontend lo resuelve pidiendo las inscripciones aparte.

**Solo cursos publicados.** El catálogo público nunca devuelve cursos con
`publicado: false`. Los no publicados se ven únicamente desde el panel admin.

### `GET /api/cursos/:slug`

Devuelve el curso completo con su temario:

```json
{
  "id": 14,
  "slug": "react-desde-cero",
  "titulo": "React desde cero",
  "resumen": "...",
  "descripcion": "Texto largo con el detalle del curso",
  "url_portada": "https://.../react.jpg",
  "categoria": "Desarrollo web",
  "nivel": "principiante",
  "publicado": true,
  "inscripto": false,
  "clases": [
    { "id": 101, "titulo": "Qué es React", "orden": 1 },
    { "id": 102, "titulo": "Componentes", "orden": 2 }
  ]
}
```

En el detalle público las clases van solo con `id`, `titulo` y `orden`. El
contenido llega recién cuando el alumno está inscripto.

Si el slug no existe, `404`.

---

## Inscripciones

### `POST /api/inscripciones`

Envía `{ "id_curso": 14 }`. Requiere token.

Devuelve `201` con la inscripción creada. Si ya estaba inscripto, `409`.

### `GET /api/mis-inscripciones`

Requiere token. Devuelve los cursos del alumno con su progreso:

```json
{
  "datos": [
    {
      "id_inscripcion": 88,
      "estado": "activa",
      "fecha_inscripcion": "2026-09-20T10:00:00Z",
      "curso": {
        "id": 14,
        "slug": "react-desde-cero",
        "titulo": "React desde cero",
        "url_portada": "https://.../react.jpg",
        "cantidad_clases": 24
      },
      "clases_completadas": 6
    }
  ]
}
```

`clases_completadas` sale de contar `PROGRESO_CLASES`. Con eso y
`cantidad_clases` el frontend dibuja la barra de progreso del dashboard.

**A confirmar:** los valores de `estado`. La propuesta es `"activa"` y
`"cancelada"`.

### `GET /api/mis-cursos/:slug`

Requiere token y estar inscripto. Devuelve el curso con el contenido completo de
las clases y cuáles están terminadas:

```json
{
  "titulo": "React desde cero",
  "clases": [
    {
      "id": 101,
      "titulo": "Qué es React",
      "descripcion": "...",
      "contenido_texto": "...",
      "url_externa": "https://...",
      "orden": 1,
      "completada": true
    }
  ]
}
```

Si no está inscripto, `403`.

### `POST /api/progreso`

Envía `{ "id_clase": 101 }`. Marca la clase como completada.

---

## Perfil

### `GET /api/mi-perfil` y `PUT /api/mi-perfil`

Los datos de la tabla `PERSONAS`:

```json
{
  "nombre": "Ana",
  "apellido": "Ruiz",
  "fecha_nacimiento": "1998-04-12",
  "pais": "Argentina"
}
```

**A confirmar:** que estos campos sean opcionales. UX pide registro simplificado,
solo correo y contraseña, así que un usuario recién registrado los tiene vacíos y
los completa cuando quiere.

---

## Administración

Todas requieren token con `rol: "admin"`. Ante un token de alumno, `403`.

| Método | Ruta | Qué hace |
|---|---|---|
| `POST` | `/api/cursos` | Crear curso |
| `PUT` | `/api/cursos/:id` | Editar curso |
| `DELETE` | `/api/cursos/:id` | Borrar curso |
| `GET` | `/api/usuarios` | Listado paginado de usuarios |
| `PUT` | `/api/usuarios/:id` | Cambiar `rol` o `activo` |

**Borrado de cursos:** el frontend pide confirmación antes. Si el curso tiene
inscriptos, que la API devuelva `409` con un mensaje claro en vez de borrar en
cascada. El administrador del DER teme justamente eso: "borrar un curso con
estudiantes inscriptos por error".

**Baja de usuarios:** no se borra la fila, se pone `activo: false`. La tabla ya
tiene ese campo.

---

## Pendiente de acordar

1. Que el login devuelva el objeto `usuario` además del token.
2. Valores exactos de `rol` y de `estado`.
3. Duración del token y si hay refresh.
4. Los cinco campos que faltan en `CURSOS`.
5. Que los campos de `PERSONAS` sean opcionales.
6. URL del mock y desde cuándo está disponible.

## Ya resuelto

- **CORS:** el backend lo tiene abierto, sirve para desarrollo y para el dominio
  de Vercel.
- **Puerto:** 4000 en local.
- **Base de datos:** PostgreSQL en Supabase.
