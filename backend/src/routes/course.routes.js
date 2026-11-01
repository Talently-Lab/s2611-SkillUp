// src/routes/course.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllCourses,
  getAllCoursesAdmin,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

// Importamos ambos middlewares
const authMiddleware = require('../middlewares/auth');
const verifyAdmin = require('../middlewares/auth.middleware');

// 1. Rutas específicas de Admin (¡OJO: ARRIBA de /:id para que no choquen!)
router.get('/admin/todos', authMiddleware, verifyAdmin, getAllCoursesAdmin);

// 2. Rutas públicas (cualquiera puede ver el catálogo o un curso puntual)
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// 3. Rutas protegidas de escritura (Requieren Login + Rol de Administrador)
router.post('/', authMiddleware, verifyAdmin, createCourse);
router.put('/:id', authMiddleware, verifyAdmin, updateCourse);
router.delete('/:id', authMiddleware, verifyAdmin, deleteCourse);

module.exports = router;