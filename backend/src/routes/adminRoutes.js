const express = require('express');
const router = express.Router();
const { getAllUsers, getAllEnrollments } = require('../controllers/adminController');

// 1. Importas ambos middlewares
const verifyToken = require('../middlewares/auth');          // El que verifica el JWT
const verifyAdmin = require('../middlewares/auth.middleware'); // El que verifica el rol admin

// 2. Los encadenas en orden en la ruta
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
router.get('/enrollments', verifyToken, verifyAdmin, getAllEnrollments);

module.exports = router;