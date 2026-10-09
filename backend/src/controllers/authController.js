const bcrypt = require('bcryptjs');
const userModel = require('../models/userModel');

const register = async (req, res) => {
  try {
    // Permite recibir email o correo, y password o contrasenia
    const correo = req.body.email || req.body.correo;
    const contrasenia = req.body.password || req.body.contrasenia;

    if (!correo || !contrasenia) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'El correo y la contraseña son obligatorios',
      });
    }

    // Verificar unicidad de correo
    const existe = await userModel.buscarPorCorreo(correo);
    if (existe) {
      return res.status(409).json({
        error: 'Conflicto',
        mensaje: 'Ya existe una cuenta con este correo electrónico',
      });
    }

    // Hashear la contraseña (10 rondas)
    const contraseniaHash = await bcrypt.hash(contrasenia, 10);

    // Guardar en la base de datos
    const nuevoUsuario = await userModel.crearUsuario(correo, contraseniaHash);

    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      mensaje: 'No se pudo completar el registro',
    });
  }
};

module.exports = {
  register,
};