// src/controllers/adminController.js
const userModel = require('../models/userModel');
const enrollmentModel = require('../models/enrollmentModel');

const getAllUsers = async (req, res) => {
    try {
        const usuarios = await userModel.getAllUsers();

        res.status(200).json({
            success: true,
            total: usuarios.length,
            datos: usuarios
        });

    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({
            success: false,
            error: 'Error interno del servidor'
        });
    }
};


const getAllEnrollments = async (req, res) => {
    try {
        const inscripciones = await enrollmentModel.getAllEnrollments();

        return res.status(200).json({
            success: true,
            count: inscripciones.length,
            data: inscripciones
        });
    } catch (error) {
        console.error('Error al obtener inscripciones:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor al obtener las inscripciones'
        });
    }
};

module.exports = {
    getAllUsers,
    getAllEnrollments
};