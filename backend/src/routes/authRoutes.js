const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

const { validateRegister } = require('../middlewares/authValidation');
const { authLimiter } = require('../middlewares/rateLimiter');

// POST /api/auth/register (con rate limit y validaciones estrictas)
router.post('/register', authLimiter, validateRegister, authController.register);

// POST /api/auth/login (con rate limit)
router.post('/login', authLimiter, authController.login);

// Ruta protegida de prueba para validar el Middleware de Autenticación
router.get('/perfil', authMiddleware, (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado al perfil',
    usuarioAutenticado: req.user,
  });
});

module.exports = router;