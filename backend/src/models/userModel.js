const db = require('../config/db'); // O la ruta a tu conexión con pg.Pool

const getAllUsers = async () => {
  const query = `
    SELECT
      u.id,
      p.nombre,
      p.apellido,
      u.correo,
      u.rol,
      u.creado_en AS fecha_registro
    FROM usuarios u
    LEFT JOIN personas p ON p.id_usuario = u.id;
  `;
  const { rows } = await db.query(query);
  return rows;
};

// 1. Registro con Transacción (usuarios + personas)
const crearUsuario = async (correo, contraseniaHash, nombre, apellido) => {
  // Obtenemos un cliente individual del pool para la transacción
  const client = await db.connect();

  try {
    await client.query('BEGIN');

    // Insertar en la tabla usuarios
    const queryUsuario = `
      INSERT INTO usuarios (correo, contrasenia_hash, rol)
      VALUES ($1, $2, 'alumno')
      RETURNING id, correo, rol;
    `;
    const resUsuario = await client.query(queryUsuario, [correo, contraseniaHash]);
    const nuevoUsuario = resUsuario.rows[0];

    // Insertar en la tabla personas vinculando el id_usuario
    const queryPersona = `
      INSERT INTO personas (id_usuario, nombre, apellido)
      VALUES ($1, $2, $3)
      RETURNING nombre, apellido;
    `;
    const resPersona = await client.query(queryPersona, [
      nuevoUsuario.id,
      nombre,
      apellido,
    ]);

    await client.query('COMMIT');

    // Devolver el objeto unificado
    return {
      ...nuevoUsuario,
      nombre: resPersona.rows[0].nombre,
      apellido: resPersona.rows[0].apellido,
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release(); // Liberar el cliente de vuelta al pool
  }
};

// 2. Búsqueda por correo trayendo nombre y apellido
const buscarPorCorreo = async (correo) => {
  const query = `
    SELECT 
      u.id,
      u.correo,
      u.contrasenia_hash,
      u.rol,
      u.activo,
      p.nombre,
      p.apellido
    FROM usuarios u
    LEFT JOIN personas p ON p.id_usuario = u.id
    WHERE LOWER(u.correo) = LOWER($1);
  `;
  const { rows } = await db.query(query, [correo]);
  return rows[0];
};

module.exports = {
  getAllUsers,
  crearUsuario,
  buscarPorCorreo,
};