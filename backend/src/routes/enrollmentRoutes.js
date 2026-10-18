// backend/src/routes/enrollmentRoutes.js
const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');
const authMiddleware = require('../middlewares/auth');

// Todas las rutas de inscripciones requieren inicio de sesión con JWT
router.use(authMiddleware);

// POST /api/enrollments -> Inscribirse a un curso
router.post('/', enrollmentController.inscribir);

// GET /api/enrollments/me -> Ver los cursos del alumno autenticado
router.get('/me', enrollmentController.obtenerMisCursos);

module.exports = router;