const express = require('express');
const router = express.Router();
const courseController = require('../controllers/course.controller');

// Ruta GET /api/courses
router.get('/', courseController.getCourses);

module.exports = router;