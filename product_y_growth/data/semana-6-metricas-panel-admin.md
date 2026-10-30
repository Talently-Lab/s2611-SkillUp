# Métricas generales para el Panel Admin

El administrador de SkillUp Campus necesita ver un resumen del negocio apenas inicia sesión. Para esto, en la cabecera del panel Admin (la ruta **/admin** de la web, a la que sólo pueden acceder los usuarios con **rol = "admin"**) se muestran tres tarjetas por parte del Frontend, cada una con un número. Los alumnos no pueden ver este panel. Este documento presente define qué define cada uno de esos números, para que Backend pueda armar un endpoint que los devuelva y Frontend los muestre en el panel Admin mencionado.


Usaremos sólo 3 números para mostrar, sin gráficos complejos ni filtros avanzados. El flujo es el siguiente: Data define las métricas (este documento), Backend arma el endpoint, y finalmente Frontend muestra las tarjetas.


### Métrica 1: Total de usuarios registrados
Responde a cuántas personas crearon una cuenta de alumno en la plataforma.

- Se utilizará la tabla `usuarios`, la **regla** es que se cuentan solo las filas con `rol = 'alumno'`. Las cuentas de administración no se cuentan, igual que en la regla acordada en la semana 2. Los **usuarios dados de baja** se cuentan, ya que se han registrado alguna vez. Un usuario con `activo = false` se registró en su momento, y el contrato indica que la baja no borra la fila. Si más adelante se quiere ver solo los usuarios activos, sería otra métrica.

### Métrica 2: Total de cursos activos
Responde a la cantidad de cursos están disponibles hoy en el catálogo.

- Se utilizará la tabla `cursos`, la **regla** es que se cuentan solo las filas con `publicado = true`. Es el mismo filtro que ya usa `GET /api/courses` para el catálogo público, así que este número tiene que coincidir con la cantidad de cursos publicados que ve un alumno. Sobre los **cursos eliminados**, hoy cuando el administrador elimina un curso la fila se borra de la tabla, así que deja de contarse sola. Si Backend cambia a un borrado lógico, es decir, marcar el curso como eliminado en vez de borrarlo (la fila sigue en la tabla, como si fuera a una papelera), en ese caso es **muy importante que se agregue esa marca al filtro. Si no se agrega, un curso eliminado que seguía publicado se contaría como activo.**

### Métrica 3: Total de inscripciones históricas
Responde a la cantidad de inscripciones que se hicieron desde que existe la plataforma.

- Se utilizará la tabla `inscripciones`, la **regla** es que se cuentan todas las filas, sin filtrar por `estado`. "Históricas" significa que una inscripción cancelada también cuenta, porque en su momento ocurrió. Para evitar **duplicados**, la restricción `UNIQUE (id_usuario, id_curso)` pedida en semanas anteriores, impide que una misma inscripción se cuente dos veces. Backend confirmó que la va a agregar.

## Propuesta para Backend
#### Se propone utilizar la siguiente ruta:

```
GET /api/admin/metrics
```

Es una sola ruta que devuelve los tres números juntos. Se propone agregarla en adminRoutes.js, el mismo archivo donde ya están las rutas de administración que hizo Backend (la lista de usuarios y la de inscripciones), para que quede protegida igual que ellas.

En cuanto a la seguridad, se requiere token y rol de admin. Sin token responde 401, y con token de alumno, 403.

### Propuesta de respuesta del endpoint:

Un objeto con los números, nada más. Los tres valores tienen que ser números enteros (`int`), no strings. Si alguna tabla está vacía, el valor es 0, nunca null, en caso de algún problema con la base de datos, responder con código 500 con el formato de error actual de la API (error y mensaje).

```json
{
  "total_usuarios": 128,
  "total_cursos_activos": 6,
  "total_inscripciones": 342
}
```


## Propuesta para Frontend:
En la parte superior del **Panel Admin** van tres tarjetas, una por métrica, con el número grande y una etiqueta debajo. Como etiquetas se sugieren "Alumnos registrados", "Cursos activos" e "Inscripciones totales", aunque Marketing puede ajustarlas. Mientras se espera la respuesta de la API se muestra un estado de carga, y si el pedido falla las tarjetas muestran un aviso de error sin romper el resto del panel. Mientras el endpoint no exista se puede simular con MSW, igual que se hizo con cursos e inscripciones anteriormente.

# Resumen
Las tres métricas quedan definidas, con su tabla y su regla de conteo. Falta que Backend implemente GET /api/admin/metrics con la seguridad y la respuesta descritas arriba.