# Semana 2 — Arquitectura de Datos y Entidades

### Objetivo

Esta semana se enfoca en coordinación con el rol Backend sobre la información que se guardará en la base de datos y la que será entregada al frontend a través de las interacciones con la API.

Data Analytics como rol necesita, para sus reportes, que coordinemos los campos obligatorios en estos dos roles anteriormente mencionados, para que en conjunto podamos capturar el flujo de la información de interacción de los usuarios.

### Por qué no se arma un DER nuevo

A pesar de que la guía de TalentyLab aconseja armar un Diagrama de Entidad-Relación para plasmar los varoles que el rol de Data necesitará, son tan pocos y pueden ser explicador de mejor forma acá sin problema, por lo que se ha determinado no hacer un DER.

La consigna de TalentyLab (recomendación) pide un Diagrama de Entidad-Relación con `Usuarios`, `Cursos` e
`Inscripciones`. Cuando Data Analytics se sumó al proyecto, Backend ya había entregado el DER (24/09) y una versión actualizada (02/10) con los cambios
pedidos por Frontend. En lugar de duplicarlo, se revisa ese modelo y los cambios que necesita Data se piden sobre él.

Fuentes revisadas: DER actualizado de Backend (02/10/2026) y
[`docs/api/contrato-api-v1.md`](../../docs/api/contrato-api-v1.md).

### Dos fuentes de datos

- **GA4:** los tres KPIs de la [Semana 1](semana-1-kpis.md) se calculan por sesión a partir de eventos de Frontend. No dependen de la base de datos.
- **Supabase:** guarda los datos de negocio reales. De ahí salen los reportes complementarios: registros por mes, inscripciones por curso y por mes, estudiantes por curso e interés por categoría y nivel.

## Campos obligatorios para los reportes

✅  Para medir los registros nuevos por período se usa la tabla `usuarios`, con los campos `id`, `rol` y `creado_en`. Estos campos ya existen en el modelo.

✅  Las inscripciones por curso y por mes salen de la tabla `inscripciones`, a partir de `id_curso` y `fecha_inscripcion`, que también existen.

 - Para calcular la cantidad de estudiantes por curso (ratio estudiante/curso) se usan `id_usuario`, `id_curso` y `estado` de la misma tabla `inscripciones`. Los campos existen, pero `estado` todavía no tiene valores definidos ⚠️, por lo que
queda pendiente de acordar con Backend (yo recomendé los estados `activa` o `cancelada`, pero cualquiera parecida servirá). ⚠️

✅ El interés por categoría y nivel se analiza con los campos `categoria`, `nivel` y `publicado` de la tabla `cursos`, que se agregaron en el DER del 02/10.

✅ Para cruzar los eventos de GA4 con la base de datos se usan `id` y `slug` de la tabla `cursos`, ya que los eventos envían `course_id` y `course_slug`.

✅ Por último, a futuro el avance del estudiante podrá medirse con la tabla `progreso_clases`, a partir de `id_inscripcion` y `completada_en`, que ya existen.




⚠️ Reglas de cálculo necesarias para los reportes:

- Los registros nuevos cuentan solo usuarios con `rol = 'alumno'`, para no
  mezclar cuentas de administración.
- Los estudiantes por curso cuentan solo inscripciones con `estado = 'activa'`.
- Los reportes de catálogo consideran solo cursos con `publicado = true`.

## Validaciones pendientes con Backend

Primero, **Inscripción única por curso.** El contrato ya indica que `POST /api/inscripciones` devuelve `409` si la persona ya estaba inscripta, pero ese control vive en la API. Se pide además la restricción `UNIQUE (id_usuario, id_curso)` en la base, para que un error de código o una carga manual no generen duplicados que inflen las inscripciones por curso.
Si alguien cancela y vuelve a inscribirse, se reactiva la misma fila (`estado` vuelve a `activa`) en lugar de crear otra.

2. **Valores permitidos de `estado`.** Hoy es texto libre (QA lo registró como BUG-02 y figura como pendiente en el contrato). La propuesta para el MVP es `CHECK (estado IN ('activa', 'cancelada'))` con valor por defecto `activa`.

Sugerencia no bloqueante: si más adelante se permite cancelar inscripciones,
guardar la fecha del cambio de estado permitiría medir bajas por período.

### Estado de la entrega y resumen:

El modelo cubre los campos que necesitan los reportes de Data Analytics. Esta validación queda cerrada cuando Backend confirme los dos puntos anteriores, se requiere acceso a la base de datos, o en su defecto el código utilizado para la creación de ésta, así puedo replicar los datos en local.