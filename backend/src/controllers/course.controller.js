// Controlador para obtener los cursos (Simulando el contrato)
exports.getCourses = async (req, res) => {
    try {
        // Más adelante, acá harás la consulta a PostgreSQL: 
        // const { rows } = await pool.query('SELECT * FROM courses');

        const mockCourses = [
            {
                "id": 1,
                "title": "Introducción a Node.js y Express",
                "description": "Aprendé a crear APIs REST escalables desde cero.",
                "instructor": "Ana Pérez",
                "price": 49.99,
                "createdAt": "2026-09-01T10:00:00Z"
            },
            {
                "id": 2,
                "title": "PostgreSQL Avanzado",
                "description": "Optimización de consultas, índices y modelado relacional.",
                "instructor": "Carlos Gómez",
                "price": 59.99,
                "createdAt": "2026-09-05T12:30:00Z"
            }
        ];

        // Respondemos exactamente con el contrato acordado
        return res.status(200).json({
            success: true,
            count: mockCourses.length,
            data: mockCourses
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error interno del servidor",
            error: error.message
        });
    }
};