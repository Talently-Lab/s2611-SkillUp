const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Requerido para la conexión remota SSL de Supabase
  },
});

// Prueba de conexión inmediata al arrancar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error al conectar con Supabase:', err.message);
  }
  client.query('SELECT NOW() AS hora_actual', (queryErr, res) => {
    release();
    if (queryErr) {
      return console.error('Error ejecutando consulta de prueba:', queryErr.message);
    }
    console.log('Conexión exitosa a PostgreSQL (Supabase). Hora del servidor DB:', res.rows[0].hora_actual);
  });
});

module.exports = pool;