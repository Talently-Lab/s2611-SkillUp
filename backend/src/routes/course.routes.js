// src/routes/course.routes.js

import { Router } from 'express';
import { 
    getAllCourses, 
    getCourseById, 
    createCourse, 
    updateCourse, 
    deleteCourse 
} from '../controllers/course.controller.js';
import verifyAdmin from '../middlewares/auth.middleware.js';

const router = Router();

// Rutas públicas (cualquiera puede ver los cursos)
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Rutas protegidas (Solo administradores)
router.post('/', verifyAdmin, createCourse);
router.put('/:id', verifyAdmin, updateCourse);
router.delete('/:id', verifyAdmin, deleteCourse);

export default router;