const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Ruta protegida de prueba para validar el Middleware de Autenticación
router.get('/perfil', authMiddleware, (req, res) => {
  res.json({
    mensaje: 'Acceso autorizado al perfil',
    usuarioAutenticado: req.user,
  });
});

module.exports = router;