# Contrato de API v1 — SkillUp Campus

**Estado:** propuesta del Frontend, a confirmar con Backend.
**Base de referencia:** el esquema de la base de datos del proyecto.

Los nombres de campo siguen el castellano que ya usa la base de datos.

**Cómo leer este documento.** Cada punto que no es obvio lleva una marca:

| Marca | Significa |
|---|---|
| **Confirmado** | Acordado con Backend, ya no se discute |
| **Actual** | Lo que el backend hace hoy, aunque no sea lo definitivo |
| **Propuesto** | Lo que pide el Frontend y todavía no existe |
| **A confirmar** | Falta una definición de Backend |

---

## Convenciones generales

**Prefijo:** todas las rutas cuelgan de `/api`.

**Puerto en desarrollo:** el backend corre en `4000`. En el frontend,
`VITE_API_URL=http://localhost:4000`.

**Autenticación:** token JWT en el header `Authorization: Bearer <token>`.

### Formato de error

**Actual.** El backend hoy responde los errores así:

```json
{
  "error": "Conflicto",
  "mensaje": "Ya existe una cuenta con este correo electrónico"
}
```

`error` es una etiqueta corta y `mensaje` es el texto para el usuario. Los datos
incompletos hoy vuelven con `400`, no con `422`.

**Propuesto.** Un formato único para toda la API, con los errores por campo:

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

`campos` es opcional y solo aparece en errores de validación. Sirve para que el
frontend marque cada error debajo del input que corresponde, en vez de mostrar
un cartel genérico arriba del formulario. Con el formato actual eso no se puede:
llega un solo `mensaje` y no hay forma de saber a qué campo pertenece.

**A confirmar:** si Backend adopta el formato propuesto. Mientras tanto, el
frontend lee `mensaje` y lo muestra como error general.

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
| 422 | Pinta los errores por campo usando `error.campos` (solo con el formato propuesto) |

---

## Autenticación

### `POST /api/auth/register`

**Actual.** La ruta hoy está en inglés: `/api/auth/register`.

**Propuesto:** pasarla a `/api/auth/registro`, para que todas las rutas del
proyecto queden en castellano.

Registro simplificado, como pide UX: nombre, correo y contraseña. El resto de
los datos personales se completan después desde el perfil.

Envía:

```json
{ "nombre": "Ana", "correo": "ana@mail.com", "contrasenia": "12345678" }
```

**Actual:** `nombre` va a la tabla `PERSONAS`, pero el backend todavía no lo
guarda. Lo ignora sin romper nada, así que el frontend ya lo puede mandar.

**Actual:** el backend acepta la contraseña como `contrasenia` o como
`password` (y el correo como `correo` o `email`). El frontend eligió
`contrasenia` y `correo`.

**A confirmar:** que Backend deje `contrasenia` como único nombre y saque el
alias `password`.

Devuelve `201`.

**Actual.** El registro no devuelve token:

```json
{
  "mensaje": "Usuario registrado exitosamente",
  "usuario": {
    "id": 14,
    "correo": "ana@mail.com",
    "rol": "alumno",
    "activo": true,
    "creado_en": "2026-09-20T10:00:00Z"
  }
}
```

**A confirmar:** si el registro va a devolver token, como el login, para que el
usuario quede logueado apenas se registra. Si no, después de registrarse el
frontend lo manda a la pantalla de login.

### `POST /api/auth/login`

Envía:

```json
{ "correo": "ana@mail.com", "contrasenia": "12345678" }
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

**Confirmado:** los valores de `rol` son `"alumno"` y `"admin"`.

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
      "categoria": "frontend",
      "nivel": "inicial",
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

**Confirmado:** la tabla `CURSOS` suma estos cinco campos que pidió el Frontend:

| Campo | Para qué lo necesita el Frontend |
|---|---|
| `slug` | La URL del detalle es `/cursos/react-desde-cero`, no `/cursos/14` |
| `nivel` | UX lo pide textual en el journey: "nivel de dificultad visible" |
| `categoria` | Sin esto no hay filtro en el catálogo, y el filtro está en el alcance |
| `url_portada` | La imagen de la tarjeta |
| `resumen` | Texto corto de dos líneas. Cortar `descripcion` a la mitad queda mal |

**Confirmado:** valores de `nivel`: `"inicial"`, `"intermedio"`, `"avanzado"`.

**Confirmado:** `categoria` es un enum cerrado en la base. Valores:
`"frontend"`, `"backend"`, `"devops"`, `"ciberseguridad"`, `"datos"`,
`"mobile"`.

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
  "categoria": "frontend",
  "nivel": "inicial",
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

`clases_completadas` sale de contar las filas de `PROGRESO_CLASES` de esa
inscripción. Con eso y `cantidad_clases` el frontend dibuja la barra de progreso
del dashboard.

**Confirmado:** `PROGRESO_CLASES` apunta a `id_inscripcion`, no a `id_usuario`.
El progreso queda atado a la inscripción del alumno en ese curso.

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

**Propuesto:** como `PROGRESO_CLASES` apunta a la inscripción, que el backend la busque a partir del
usuario del token y del curso de la clase. El frontend no necesita mandar
`id_inscripcion`.

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

**A confirmar:** que estos campos sean opcionales. UX pide un registro
simplificado: solo `nombre` llega desde el registro (y hoy el backend no lo
guarda), así que un usuario recién registrado tiene el resto vacío y lo completa
cuando quiere.

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
2. Valores exactos de `estado` en inscripciones.
3. Duración del token y si hay refresh.
4. Que los campos de `PERSONAS` sean opcionales.
5. URL del mock y desde cuándo está disponible.
6. Que `contrasenia` quede como único nombre y se saque el alias `password`.
7. Pasar la ruta de registro de `/register` a `/registro`.
8. Si el registro devuelve token para que el usuario quede logueado.
9. Que el backend guarde el `nombre` que llega en el registro.
10. Si se adopta el formato de error con `campos`.
11. Cómo se modela el instructor del curso.
12. Cómo se guarda la duración del curso.

## Ya resuelto

- **CORS:** el backend lo tiene abierto, sirve para desarrollo y para el dominio
  de Vercel.
- **Puerto:** 4000 en local.
- **Base de datos:** PostgreSQL en Supabase.
- **Campos de `CURSOS`:** `slug`, `nivel`, `categoria`, `url_portada` y
  `resumen`.
- **Valores de `rol`:** `"admin"` y `"alumno"`.
- **Valores de `nivel`:** `"inicial"`, `"intermedio"`, `"avanzado"`.
- **Valores de `categoria`:** enum cerrado con `frontend`, `backend`, `devops`,
  `ciberseguridad`, `datos`, `mobile`.
- **`PROGRESO_CLASES`:** apunta a `id_inscripcion`.
