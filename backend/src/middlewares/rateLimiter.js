// backend/src/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // Ventana de 1 minuto
  max: 5, // Máximo 5 solicitudes por IP por minuto
  standardHeaders: true, // Retorna RateLimit-* en los headers estándar
  legacyHeaders: false, // Desactiva cabeceras X-RateLimit-* obsoletas
  handler: (req, res) => {
    return res.status(429).json({
      error: 'Demasiadas peticiones',
      mensaje: 'Has superado el límite de intentos permitidos. Por favor, esperá un minuto antes de volver a intentar.',
    });
  },
});

module.exports = {
  authLimiter,
};