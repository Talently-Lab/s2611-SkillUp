const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middlewares/auth');

router.get('/mis-cursos/:slug', authMiddleware, studentController.obtenerClasesCurso);
router.post('/progreso', authMiddleware, studentController.marcarProgresoClase);

module.exports = router;