// src/models/courseModel.js
const db = require('../config/db');

// Listar cursos publicados con conteo de clases para el catálogo
const obtenerTodos = async () => {
  const query = `
    SELECT 
      c.id,
      c.titulo,
      c.slug,
      c.categoria,
      c.nivel,
      c.resumen,
      c.url_portada AS imagen,
      COUNT(cl.id)::int AS cantidad_clases
    FROM cursos c
    LEFT JOIN clases cl ON cl.id_curso = c.id
    WHERE c.publicado = true
    GROUP BY c.id
    ORDER BY c.creado_en DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};
// Listar TODOS los cursos (incluyendo borradores) para el panel de Admin
const obtenerTodosAdmin = async () => {
  const query = `
    SELECT 
      c.id,
      c.titulo,
      c.slug,
      c.categoria,
      c.nivel,
      c.resumen,
      c.url_portada AS imagen,
      c.publicado, -- Importante para que el frontend sepa si está publicado o borrador
      COUNT(cl.id)::int AS cantidad_clases
    FROM cursos c
    LEFT JOIN clases cl ON cl.id_curso = c.id
    GROUP BY c.id
    ORDER BY c.creado_en DESC;
  `;
  const { rows } = await db.query(query);
  return rows;
};
// Obtener un curso por ID numérico o por Slug
const obtenerPorId = async (identificador) => {
  // Comprueba si contiene únicamente números (ej: "1") o si es un slug (ej: "nodejs-express-desde-cero")
  const esNumero = /^\d+$/.test(identificador);
  const columnaFiltro = esNumero ? 'c.id' : 'c.slug';

  const query = `
    SELECT 
      c.id,
      c.titulo,
      c.descripcion,
      c.slug,
      c.categoria,
      c.nivel,
      c.resumen,
      c.url_portada AS imagen,
      c.publicado,
      COUNT(cl.id)::int AS cantidad_clases
    FROM cursos c
    LEFT JOIN clases cl ON cl.id_curso = c.id
    WHERE ${columnaFiltro} = $1
    GROUP BY c.id;
  `;
  const { rows } = await db.query(query, [identificador]);
  return rows[0];
};

// Crear curso (Admin)
const crear = async (datos) => {
  const { titulo, descripcion, slug, categoria, nivel, resumen, url_portada } = datos;
  const query = `
    INSERT INTO cursos (titulo, descripcion, slug, categoria, nivel, resumen, url_portada, publicado)
    VALUES ($1, $2, $3, $4, $5, $6, $7, true)
    RETURNING *;
  `;
  const values = [titulo, descripcion, slug, categoria, nivel, resumen, url_portada];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Actualizar curso (Admin) - Versión con saneamiento de strings vacíos a null
const actualizar = async (id, datos) => {
  const camposPermitidos = [
    'titulo', 
    'descripcion', 
    'slug', 
    'categoria', 
    'nivel', 
    'resumen', 
    'url_portada', 
    'publicado'
  ];

  const sets = [];
  const valores = [];
  let index = 1;

  for (const [key, value] of Object.entries(datos)) {
    if (camposPermitidos.includes(key)) {
      sets.push(`${key} = $${index}`);
      
      // 🟢 Si el campo es 'categoria' (o cualquiera) y viene como string vacío "", lo convertimos a null
      const valorSanitizado = (value === "") ? null : value;
      
      valores.push(valorSanitizado);
      index++;
    }
  }

  if (sets.length === 0) {
    return null;
  }

  valores.push(id);

  const query = `
    UPDATE cursos
    SET ${sets.join(', ')}
    WHERE id = $${index}
    RETURNING *;
  `;

  const { rows } = await db.query(query, valores);
  return rows[0];
};

// Eliminar curso (Admin)
const eliminar = async (id) => {
  const query = 'DELETE FROM cursos WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Verifica si un curso tiene alumnos inscriptos
const verificarAlumnosInscriptos = async (idCurso) => {
  const { rows } = await db.query(
    'SELECT COUNT(*)::int AS total FROM inscripciones WHERE id_curso = $1',
    [idCurso]
  );
  return rows[0].total > 0;
};

module.exports = {
  obtenerTodos,
  obtenerTodosAdmin,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  verificarAlumnosInscriptos,
};