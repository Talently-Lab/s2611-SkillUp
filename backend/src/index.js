require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

// 1. Importar rutas y middlewares
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/course.routes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// 2. Confianza en el proxy de Render (indispensable para express-rate-limit)
app.set('trust proxy', 1);

// 3. Configuración de CORS adaptativa (acepta local y el front de Daniela en Vercel)
const allowedOrigins = [
  'https://skillup-campus.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permite peticiones sin origin (Postman, curl) o si coincide con la lista blanca
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por política de CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json());

// 4. Rutas base y de diagnóstico
app.get('/', (req, res) => {
  res.json({ mensaje: 'API SkillUp Campus operativa' });
});

// Endpoint liviano para UptimeRobot (no satura la base de datos)
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Health check profundo que valida la conexión física con Supabase
app.get('/api/salud-db', async (req, res) => {
  try {
    const resultado = await db.query(
      'SELECT current_database() AS base_datos, NOW() AS fecha_servidor'
    );
    res.json({
      estado: 'Conectado',
      base_datos: resultado.rows[0].base_datos,
      hora_servidor: resultado.rows[0].fecha_servidor,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fallo al conectar con la base de datos',
      detalle: error.message,
    });
  }
});

// 5. Montar rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/admin', adminRoutes);

// 6. Manejador global de errores (DEBE IR AL FINAL DE ABSOLUTAMENTE TODAS LAS RUTAS)
app.use(errorHandler);

// 7. Inicializar escucha del servidor
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});