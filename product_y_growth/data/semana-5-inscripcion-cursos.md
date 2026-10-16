## Diccionario de datos y Ratio de Interés.

Para un mayor orden, el entregable completo está en la planilla
[`semana-5-inscripcion-cursos.xlsx`](semana-5-inscripcion-cursos.xlsx): diccionario de datos del evento `course_enrolled`, recorrido de los datos al inscribirse y simulador del Ratio de Interés. Este documento resume lo que Frontend y Backend necesitan saber, pero es necesario revisar la planilla .xlsx (que se puede abrir en Google Sheets desde el navegador) para entender mejor el cálculo. Favor de revisar las tres hojas.

### Evento `course_enrolled`

`course_enrolled` es la inscripción confirmada. Cuando alguien presiona "Inscribirme" y `POST /api/inscripciones` responde `201`, queda guardada una fila en la tabla `inscripciones`. En GA4, ese mismo momento se registra con el evento `enrollment_success`, definido en la Semana 4.

### Datos que se guardan en la base de datos (rol backend)

**`id`**: Identificador de la inscripción. Lo genera la base de datos.

**`id_usuario`**: Quién se inscribe. No viaja en el cuerpo de la petición: Backend lo obtiene del token de sesión, para que nadie pueda inscribir a otra persona.

**`id_curso`**: El curso elegido. Es el único dato que envía Frontend, en el cuerpo de la petición: `{ "id_curso": 14 }`.

**`estado`**: `activa` por defecto, o `cancelada` (acordado en la Semana 2, hizo merge a main ya).

**`fecha_inscripcion`**: Fecha y hora de la inscripción. La genera la base de datos y no el navegador, porque el reloj del navegador puede estar mal configurado o ser manipulado.

Una persona no puede inscribirse dos veces en el mismo curso: la restricción `UNIQUE (id_usuario, id_curso)` hace que la API responda `409`. Los nombres de la consigna (`user_id`, `course_id`, `timestamp`) corresponden a `id_usuario`, `id_curso` y `fecha_inscripcion`, los nombres reales de la base de datos.

### Ratio de Interés

```
Ratio de Interés = clics en "Inscribirme" (attempt_enrollment) / clics en "Ver más" (click_course_detail) × 100
```

Este ratio se calcula por curso, con los eventos previos de la semana 4, "Ver detalle del curso", como lo llama la consigna, es el botón "Ver más" de las tarjetas del catálogo. 

Un ratio bajo significa que mucha gente mira el curso pero pocos intentan inscribirse: hay que revisar la descripción del curso (Marketing) o que el botón funcione (QA). En la planilla, los cursos por debajo del umbral de alerta (20%, ajustable) quedan marcados como "Revisar".
