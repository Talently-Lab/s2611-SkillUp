// src/controllers/adminController.js
const pool = require('../config/db');

const getAllUsers = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id,
                p.nombre,
                p.apellido,
                u.correo,
                u.rol,
                u.creado_en AS fecha_registro
            FROM usuarios u
            LEFT JOIN personas p ON p.id_usuario = u.id
        `;

        const resultado = await pool.query(query);

        res.status(200).json({
            success: true,
            total: resultado.rowCount,
            datos: resultado.rows
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
        // Simulación o consulta a PostgreSQL
        const mockEnrollments = [
            { id: 1, userId: 2, courseId: 1, enrolledAt: "2026-09-10T08:00:00Z" }
        ];

        return res.status(200).json({
            success: true,
            count: mockEnrollments.length,
            data: mockEnrollments
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getAllUsers,
    getAllEnrollments
};