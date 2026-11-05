# Data QA (Pruebas de Telemetría) - Semana 7

He revisado que frontend esté enviando los eventos requeridos a Google Analytics 4 (GA4), y contrasté las métricas del panel de admin contra los datos reales de la base de datos.

## Pruebas de telemetría en Network

Realicé la prueba completa del flujo de inscripción de cursos en modo incógnito, en la pestaña 'Network', filtrando por 'collect', que son las llamadas que van a los servidores de GA4 (sólo funciona en producción actualmente).

El flujo de inscripción de cursos dispara los siguientes eventos definidos en semanas anteriores:

**`view_course_list`**: Se dispara al entrar a /cursos. No lleva parámetros y se envía una sola vez por visita para no inflar las visitas al catálogo.

**`click_course_detail`**: Se dispara cuando el usuario toca "Ver más" en una tarjeta. Envía el course_id, el slug, la categoría y la posición de la tarjeta en la grilla.

**`view_course`**: Se dispara al cargar la página del curso con su course_id y categoría.

**`attempt_enrollment`**: Se dispara apenas la persona hace clic en "Inscribirme". Envía el `course_id` y la categoría del curso elegido.

**`enrollment_success`**: Es el evento course_enrolled propuesto previamente. Se dispara únicamente cuando el backend responde 201. Envía el course_id, la categoría y el course_slug.

Sobre el user_id: no viaja adentro de cada evento suelto. La plataforma usa la función sincronizarUsuario() que llama a `gtag('set', { user_id })` apenas el alumno inicia sesión o se registra. En la petición de Network viaja como el parámetro uid con el id numérico del alumno (por ejemplo uid=14), tal como lo definimos en la matriz de eventos.

## Validación de métricas contra la base de datos

Hice la consulta manual en la base de datos para comparar los datos reales con las métricas definidas para el panel de administrador:

- El **total de usuarios registrados** en la base de datos es de 13 usuarios en total, siguiendo la regla que acordamos, que propone no contar las cuentas de administración para las métricas, se cuentan sólo los que tienen rol = alumno. El conteo da 12 alumnos, la métrica es, por lo tanto, correcta.

- El **total de cursos activos** en la base de datos es 5, y los 5 tienen publicado = true, por lo que la métrica es correcta, ya que coincide con los cursos que se ven en el catálogo público.

- El **total de inscripciones históricas** en la tabla inscripciones es 9, todas en estado activa.

Las métricas coinciden con los valores reportados en la base de datos.

## Reporte preventivo sobre las métricas:

Como rol de frontend, previamente hemos podido notar un problema con el esquema de la base de datos: las relaciones de las tablas **inscripciones.id_curso** y **clases.id_curso** estaban configuradas con **ON DELETE CASCADE**. Esto implica que, si un administrador borra un curso y se procesa en la base de datos, la eliminación también borra automáticamente todas las inscripciones que tenían los alumnos en ese curso. Si esto pasa, se pierde el historial y la métrica de **inscripciones históricas** se rompe, porque resta inscripciones que en su momento existieron. 

Para solucionarlo, se propone implementar un borrado lógico (soft delete), agregando un campo como activo = false, o eliminado_en (esto será decisión de backend), para que así el curso deje de mostrarse, pero las filas sigan existiendo. Es necesario coordinar con frontend una vez realizada la adecuación, para que pueda procesar correctamente la nueva respuesta entregada por la API del backend.


Por ahora, backend (HunterDreams) ha armado una solución en su rama que bloquea el borrado: si el curso tiene inscriptos y se intenta eliminar, **se retorna un 409**, esto evita que se borre el historial por accidente, queda pendiente la propuesta del soft delete, porque la solución actual bloquea que un administrador pueda eliminar un curso.