// src/routes/course.routes.js
const express = require('express');
const router = express.Router();

const {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

// Importamos ambos middlewares
const authMiddleware = require('../middlewares/auth');
const verifyAdmin = require('../middlewares/auth.middleware');

// Rutas públicas (cualquiera puede ver el catálogo)
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Rutas protegidas (Requiere Login + Rol de Administrador)
router.post('/', authMiddleware, verifyAdmin, createCourse);
router.put('/:id', authMiddleware, verifyAdmin, updateCourse);
router.delete('/:id', authMiddleware, verifyAdmin, deleteCourse);

module.exports = router;