// backend/src/middlewares/authValidation.js
const { body, validationResult } = require('express-validator');

// Middleware para capturar y devolver errores en formato estandarizado
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Datos inválidos',
      mensaje: errors.array()[0].msg,
      detalles: errors.array().map((err) => ({
        campo: err.path,
        mensaje: err.msg,
      })),
    });
  }
  next();
};

// Reglas estrictas para el registro
const validateRegister = [
  // Normalización previa para compatibilidad frontend (español / inglés)
  (req, res, next) => {
    if (req.body.email && !req.body.correo) req.body.correo = req.body.email;
    if (req.body.password && !req.body.contrasenia) req.body.contrasenia = req.body.password;
    if (req.body.name && !req.body.nombre) req.body.nombre = req.body.name;
    if (req.body.lastname && !req.body.apellido) req.body.apellido = req.body.lastname;
    next();
  },

  // 1. Nombre obligatorio y no vacío
  body('nombre')
    .trim()
    .notEmpty()
    .withMessage('El nombre es obligatorio'),

  // 2. Correo con formato válido y normalizado
  body('correo')
    .trim()
    .notEmpty()
    .withMessage('El correo electrónico es obligatorio')
    .isEmail()
    .withMessage('Debe ingresar un formato de correo electrónico válido')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false
    }),

  // 3. Contraseña mínima de 8 caracteres
  body('contrasenia')
    .notEmpty()
    .withMessage('La contraseña es obligatoria')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres'),

  handleValidationErrors,
];

module.exports = {
  validateRegister,
};