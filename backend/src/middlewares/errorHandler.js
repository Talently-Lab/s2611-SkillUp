// backend/src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(`[Error Handler] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || err.status || 500;
  const mensaje = err.message || 'Ocurrió un problema inesperado en el servidor';

  return res.status(statusCode).json({
    error: 'Error interno del servidor',
    mensaje,
    // Solo enviamos el detalle técnico en desarrollo para debugging
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
};

module.exports = errorHandler;