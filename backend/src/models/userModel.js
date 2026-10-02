const db = require('../config/db');

// Buscar si el correo ya existe
const buscarPorCorreo = async (correo) => {
  const query = 'SELECT * FROM usuarios WHERE correo = $1';
  const { rows } = await db.query(query, [correo]);
  return rows[0];
};

// Insertar nuevo usuario con rol 'alumno' por defecto
const crearUsuario = async (correo, contraseniaHash) => {
  const query = `
    INSERT INTO usuarios (correo, contrasenia_hash, rol, activo)
    VALUES ($1, $2, 'alumno', true)
    RETURNING id, correo, rol, activo, creado_en;
  `;
  const { rows } = await db.query(query, [correo, contraseniaHash]);
  return rows[0];
};

module.exports = {
  buscarPorCorreo,
  crearUsuario,
};