# Semana 1 — KPIs iniciales y plan de medición

## Objetivo
Vamos a definir cómo vamos a saber si el recorrido principal de SkillUp Campus funciona: una persona entra a la web, se registra y se inscribe en un curso. Para esta primera etapa se priorizan métricas que puedan capturarse desde el frontend y que sean útiles para decidir dónde mejorar el producto.

La medición se hará por sesión. Así se evita que varias interacciones de una misma persona inflen los resultados en las mismas métricas.

## Flujo de captura

1. La persona entra a una pantalla del producto y React identifica la vista o la acción relevante.
2. Frontend envía el evento a Google Analytics 4 con los datos mínimos del contexto. GA4 guarda los eventos y permite consultarlos después.
3. Si la acción depende de la API, como registrar una cuenta o crear una inscripción, Frontend espera la respuesta antes de marcarla como exitosa o fallida.
4. Supabase conserva los datos de negocio reales —usuarios, cursos e inscripciones—, mientras que GA4 conserva el comportamiento de navegación y conversión.
5. Data Analytics consulta los eventos en GA4 y calcula los tres indicadores en Google Sheets o en un dashboard cuando exista suficiente información, para consultas y análisis posteriores.

## KPI 1: Tasa de conversión de registro
Responde si el formulario de registro logra convertir en cuentas creadas. Este indicador permite detectar fricción en el formulario, en sus validaciones o en la comunicación con la API. Un clic en el botón no cuenta como éxito: el evento `register_success` se registra únicamente después de que la API confirme la creación de la cuenta, esto debe ser procesado por el backend y capturado por el frontend.

Usamos la fórmula:

```
sesiones con register_success / sesiones con view_register_form × 100
```

## KPI 2: Tasa de exploración del catálogo
Qué tanto las personas que miran el catálogo realmente hacen click sobre los cursos para saber más de ellos. Sirve para comparar el interés generado por los cursos, categorías, títulos y descripciones. Si el resultado es bajo, conviene replantear primero el contenido y la presentación de las tarjetas antes de modificar el flujo de inscripción, que también puede ser un obstáculo.

Usamos la fórmula:

```
sesiones con click_course_detail / sesiones con view_course_list × 100
```

## KPI 3: Tasa de inscripción desde el detalle
Responde si el interés por un curso termina en una inscripción efectiva. Es la conversión central del producto: una persona que revisa un curso pasa a formar parte de él. Parecido a la tasa de conversión de registro, la inscripción se considera exitosa solo cuando el backend responde correctamente y el frontend lo valida.

```
sesiones con enrollment_success / sesiones con view_course_detail × 100
```

## Eventos mínimos que debe registrar Frontend

- Al abrir la página de registro, Frontend debe registrar `view_register_form`.

- Al enviar el formulario puede registrar `click_register`; luego debe registrar `register_success` o `register_error` según la respuesta de la API, deberá coordinarse con rol de backend.

- Al abrir el catálogo debe registrar `view_course_list`. Cuando la persona selecciona el botón "Ver más" de una tarjeta, debe enviar `click_course_detail` junto con el curso seleccionado. 

- Al abrir `/cursos/:slug`, debe registrar `view_course_detail`.

> Los dos puntos anteriores están conectados, si alguien hace click en "Ver más" en una tarjeta, pero no se llega a capturar el evento `view_course_detail`, entonces sabemos que hay un problema con el flujo. Ejemplo: el enlace hacia el curso no funciona.

- Cuando exista el botón de inscripción, Frontend debe registrar `attempt_enrollment` al iniciar la acción. Tras la respuesta de la API (que deberá coordinar con rol de backend), registrará `enrollment_success` o `enrollment_error` según corresponda.

> Cada evento necesita, como mínimo; fecha y hora, nombre del evento, `session_id` y ruta de la página. Los eventos relacionados con cursos deben incluir; `course_id`, `course_slug` y `category`. Cuando haya una sesión iniciada debe incluirse `user_id` (o sea, esto es opcional).

Es importante, por seguridad y privacidad, que no deben enviarse a analítica datos sensibles: correo, nombre, contraseña, token ni mensajes de error completos.


## Resumen del alcance de esta semana

En esta semana se definen y documentan los indicadores y eventos necesarios a capturar. La integración con Google Analytics 4 (GA4) y la correspondiente definición y captura de eventos del frontend y backend se hará cuando se implementen los requerimientos necesarios para estos roles durante la próxima semana.