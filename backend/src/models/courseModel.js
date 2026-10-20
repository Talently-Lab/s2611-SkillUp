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

// Actualizar curso (Admin)
const actualizar = async (id, datos) => {
  const { titulo, descripcion, slug, categoria, nivel, resumen, url_portada, publicado } = datos;
  const query = `
    UPDATE cursos
    SET 
      titulo = COALESCE($1, titulo),
      descripcion = COALESCE($2, descripcion),
      slug = COALESCE($3, slug),
      categoria = COALESCE($4, categoria),
      nivel = COALESCE($5, nivel),
      resumen = COALESCE($6, resumen),
      url_portada = COALESCE($7, url_portada),
      publicado = COALESCE($8, publicado)
    WHERE id = $9
    RETURNING *;
  `;
  const values = [titulo, descripcion, slug, categoria, nivel, resumen, url_portada, publicado, id];
  const { rows } = await db.query(query, values);
  return rows[0];
};

// Eliminar curso (Admin)
const eliminar = async (id) => {
  const query = 'DELETE FROM cursos WHERE id = $1 RETURNING *;';
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
};