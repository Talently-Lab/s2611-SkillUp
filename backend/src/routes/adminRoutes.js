// src/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const { getAllUsers, getAllEnrollments } = require('../controllers/adminController');
const verifyAdmin = require('../middlewares/auth.middleware'); // O la ruta donde lo hayas guardado

// Rutas protegidas estrictamente para administradores
router.get('/users', verifyAdmin, getAllUsers);
router.get('/enrollments', verifyAdmin, getAllEnrollments);

module.exports = router;