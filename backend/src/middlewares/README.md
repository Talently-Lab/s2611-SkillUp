# 🛡️ Middlewares

Funciones intermedias que interceptan las peticiones antes de llegar a los controladores:
* `auth.middleware.js`: Verificación y decodificación de tokens JWT.
* `role.middleware.js`: Control de acceso por roles (restringir acceso de Admin vs Alumno).
* `validator.middleware.js`: Sanitización y validación de datos de entrada.
* `error.middleware.js`: Manejo global y captura centralizada de excepciones.
