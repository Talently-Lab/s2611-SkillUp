// src/middlewares/auth.middleware.js

const verifyAdmin = (req, res, next) => {
    // Nota: Asumimos que un middleware previo de autenticación (ej: JWT) 
    // inyecta la información del usuario decodificada en req.user
    const user = req.user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "No autorizado. Token no proporcionado o inválido."
        });
    }

    if (user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: "Acceso denegado. Se requieren permisos de administrador."
        });
    }

    // Si es admin, lo dejamos pasar al controlador
    next();
};

export default verifyAdmin;