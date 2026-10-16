# Eventos del catálogo de cursos y matriz de telemetría.

Para un mayor orden, el entregable completo está en la planilla
[`semana-4-eventos-catalogo.xlsx`](semana-4-eventos-catalogo.xlsx): matriz de eventos, parámetros, tipos de error y su equivalente en GA4. Este documento resume lo que Frontend necesita implementar, pero es necesario revisar la planilla .xlsx (que se puede abrir en Google Sheets desde el navegador) para entender mejor el flujo de eventos. Favor de revisar las dos hojas.

Los eventos se envían desde el navegador directamente a GA4, no al backend. El backend solo interviene a través de las respuestas de la API, que determinan si se envía `enrollment_success` o `enrollment_error`.

### Eventos propuestos

**`view_course_list`**: Al abrir `/cursos`, una vez por visita (sesión, que en GA4 caduca en 30m por defecto). No lleva parámetros.

**`click_course_detail`**: Este evento registra que alguien, desde el catálogo, presione «Ver más» en una tarjeta de curso. Envía `course_id`, `course_slug`, `category`, `level` y `position`. El parámetro `position` es literalmente la posición de la tarjeta respecto de las demás, contando desde 1, para detectar si alguien la presionó simplemente por ser la primera.

**`view_course_detail`**: Al abrir `/cursos/:slug`, una vez por visita. Envía `course_id`, `course_slug`, `category` y `level`. Si alguien presiona «Ver más» pero este evento no llega, el enlace al detalle está fallando y hay que revisarlo.

**`attempt_enrollment`**: Este evento registra que alguien presione el botón de inscripción, antes de la respuesta de la API. Envía `course_id`, `course_slug` y `category`.

**`enrollment_success`**: Cuando `POST /api/inscripciones` responde `201`. Envía `course_id`, `course_slug` y `category`.

**`enrollment_error`**: El error al inscribirse puede ocurrir porque no hay sesión iniciada o porque la API responde con error. Envía `course_id`, `course_slug`, `category` y el tipo de error (`error_type`), especificado más abajo.

`category` y `level` se envían con los valores de la API, en minúscula (`frontend`, `inicial`), no con el texto que se muestra en la tarjeta, para mantener la consistencia con los valores reales de la base de datos.

### Valores de `error_type`

Estos valores corresponden solo a `enrollment_error`. Los errores del registro (`register_error`) están definidos en la Semana 3.

**`sin_sesion`**: La persona presiona inscribirse sin haber iniciado sesión y se la envía al login.

**`sesion_expirada`**: La API responde `401`: el token venció o no es válido.

**`ya_inscripto`**: La API responde `409`: la persona ya estaba inscripta en ese curso.

**`error_servidor`**: La API responde `5xx`.

**`sin_conexion`**: La API no responde (`status 0` en el cliente de API).

GA4 agrega solo la fecha, la sesión y la página. No se envían correo, nombre, contraseña, token ni mensajes de error completos.
