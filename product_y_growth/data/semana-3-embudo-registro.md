# Embudo de registro y matriz de eventos.

Para un mayor orden, el entregable completo está en la planilla
[`semana-3-embudo-registro.xlsx`](semana-3-embudo-registro.xlsx): matriz de eventos, tipos de error y cálculo de la tasa de conversión de registro. Este documento resume lo que Frontend necesita implementar, pero es necesario revisar la planilla .xlsx (que se puede abrir en Google Sheets desde el navegador) para que se pueda entender mejor el flujo de eventos. Favor de revisar las tres hojas.

### Eventos propuestos
**`view_register_form`**: Al abrir `/registro`, una vez por visita (sesión, que en GA4 caduca en 30m por defecto).

**`click_register`**: Este evento registra que alguien, una vez en la vista del registro, presione en el botón de registrarse. Este evento es considerado previo a las validaciones por Zod y de las respuestas de la API.

**`register_success`**: Cuando la API responde `201`.

**`register_error`**: El error al registrarse puede ocurrir por dos motivos; el error proviene de las validaciones (Zod), o de la API. Hay varios tipos de error (`error_type`), especificados más abajo. En caso que el error sea por las validaciones (Zod), hay un parámetro de `error_field`, que indica si el error proviene del e-mail o la contraseña.

### Valores de `error_type`

**`validacion_formulario`**: Zod rechaza el formulario. `error_field`: `correo` o `contrasenia`.

**`datos_incompletos`**: La API responde `400`.
**`correo_duplicado`**: La API responde `409`.
**`error_servidor`**: La API responde `5xx`.
**`sin_conexion`**: La API no responde (`status 0` en el cliente de API).

GA4 agrega solo la fecha, la sesión y la página. No se envían correo, nombre, contraseña, token ni mensajes de error completos.

### Fórmula de conversión de registro:

```
Tasa de conversión de registro = sesiones con register_success / sesiones con view_register_form × 100
```
