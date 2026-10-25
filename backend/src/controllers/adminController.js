// src/controllers/adminController.js

const getAllUsers = async (req, res) => {
    try {
        // Simulación adaptada para devolver un array de usuarios con la clave 'datos' que espera el componente de la tabla
        const mockUsers = [
            { 
                id: 1, 
                nombre: "Admin Master", 
                correo: "admin@skillup.com", 
                rol: "admin", 
                fecha_registro: "2026-09-01T10:00:00Z" 
            },
            { 
                id: 2, 
                nombre: "", // Manejado vacío como pidió 
                correo: "juan@example.com", 
                rol: "student", 
                fecha_registro: "2026-09-10T12:30:00Z" 
            }
        ];

        // Respuesta con la clave 'datos' que espera el componente de la tabla
        return res.status(200).json({
            datos: mockUsers
        });
    } catch (error) {
        return res.status(500).json({ 
            success: false, 
            message: error.message 
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