require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// 1. Importar rutas
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares obligatorios
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// 2. Montar rutas de la API
app.use('/api/auth', authRoutes);

// Ruta básica de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: 'API SkillUp Campus operativa' });
});

// Ruta de diagnóstico (health check de la BD)
app.get('/api/salud-db', async (req, res) => {
  try {
    const resultado = await db.query('SELECT current_database() AS base_datos, NOW() AS fecha_servidor');
    res.json({
      estado: 'Conectado',
      base_datos: resultado.rows[0].base_datos,
      hora_servidor: resultado.rows[0].fecha_servidor,
    });
  } catch (error) {
    res.status(500).json({ error: 'Fallo al conectar con la base de datos', detalle: error.message });
  }
});

// Inicializar escucha del servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});