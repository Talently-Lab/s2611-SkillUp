const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

//Registro
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

// Login con JWT
const login = async (req, res) => {
  try {
    const correo = req.body.email || req.body.correo;
    const contrasenia = req.body.password || req.body.contrasenia;

    if (!correo || !contrasenia) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'El correo y la contraseña son obligatorios',
      });
    }

    // Buscar usuario en la base de datos
    const usuario = await userModel.buscarPorCorreo(correo);
    if (!usuario) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos',
      });
    }

    // Validar contraseña hasheada
    const contraseniaValida = await bcrypt.compare(contrasenia, usuario.contrasenia_hash);
    if (!contraseniaValida) {
      return res.status(401).json({
        error: 'Credenciales inválidas',
        mensaje: 'Correo o contraseña incorrectos',
      });
    }

    // Generar Token con payload { id, role } y vencimiento de 24h
    const token = jwt.sign(
      {
        id: usuario.id,
        role: usuario.rol,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      }
    );

    return res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        correo: usuario.correo,
        rol: usuario.rol,
      },
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      mensaje: 'No se pudo iniciar sesión',
    });
  }
};

module.exports = {
  register,
  login,
};