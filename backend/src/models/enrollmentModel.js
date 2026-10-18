// backend/src/models/enrollmentModel.js
const db = require('../config/db');

// 1. Verificar si el usuario ya está inscripto a un curso específico
const buscarInscripcion = async (idUsuario, idCurso) => {
  const query = `
    SELECT * 
    FROM inscripciones 
    WHERE id_usuario = $1 AND id_curso = $2;
  `;
  const { rows } = await db.query(query, [idUsuario, idCurso]);
  return rows[0];
};

// 2. Verificar existencia del curso
const verificarCursoExiste = async (idCurso) => {
  const query = `
    SELECT id, titulo, publicado 
    FROM cursos 
    WHERE id = $1;
  `;
  const { rows } = await db.query(query, [idCurso]);
  return rows[0];
};

// 3. Crear una nueva inscripción
const crearInscripcion = async (idUsuario, idCurso) => {
  const query = `
    INSERT INTO inscripciones (id_usuario, id_curso, estado, fecha_inscripcion)
    VALUES ($1, $2, 'activa', NOW())
    RETURNING id, id_usuario, id_curso, estado, fecha_inscripcion;
  `;
  const { rows } = await db.query(query, [idUsuario, idCurso]);
  return rows[0];
};

// 4. Obtener detalle formateado de una inscripción por su ID
const obtenerInscripcionPorId = async (idInscripcion) => {
  const query = `
    SELECT 
      i.id AS id_inscripcion,
      i.estado,
      i.fecha_inscripcion,
      COUNT(DISTINCT pc.id)::int AS clases_completadas,
      c.id AS curso_id,
      c.slug,
      c.titulo,
      c.url_portada,
      c.categoria,
      COUNT(DISTINCT cl.id)::int AS cantidad_clases
    FROM inscripciones i
    JOIN cursos c ON i.id_curso = c.id
    LEFT JOIN clases cl ON cl.id_curso = c.id
    LEFT JOIN progreso_clases pc ON pc.id_inscripcion = i.id
    WHERE i.id = $1
    GROUP BY i.id, c.id;
  `;
  const { rows } = await db.query(query, [idInscripcion]);
  if (!rows[0]) return null;

  const r = rows[0];
  return {
    id_inscripcion: r.id_inscripcion,
    estado: r.estado,
    fecha_inscripcion: r.fecha_inscripcion,
    clases_completadas: r.clases_completadas || 0,
    curso: {
      id: r.curso_id,
      slug: r.slug,
      titulo: r.titulo,
      url_portada: r.url_portada,
      cantidad_clases: r.cantidad_clases || 0,
      categoria: r.categoria,
    },
  };
};

// 5. Obtener todos los cursos inscriptos de un usuario con el formato del Frontend
const obtenerCursosPorUsuario = async (idUsuario) => {
  const query = `
    SELECT 
      i.id AS id_inscripcion,
      i.estado,
      i.fecha_inscripcion,
      COUNT(DISTINCT pc.id)::int AS clases_completadas,
      c.id AS curso_id,
      c.slug,
      c.titulo,
      c.url_portada,
      c.categoria,
      COUNT(DISTINCT cl.id)::int AS cantidad_clases
    FROM inscripciones i
    JOIN cursos c ON i.id_curso = c.id
    LEFT JOIN clases cl ON cl.id_curso = c.id
    LEFT JOIN progreso_clases pc ON pc.id_inscripcion = i.id
    WHERE i.id_usuario = $1
    GROUP BY i.id, c.id
    ORDER BY i.fecha_inscripcion DESC;
  `;
  const { rows } = await db.query(query, [idUsuario]);

  return rows.map((r) => ({
    id_inscripcion: r.id_inscripcion,
    estado: r.estado,
    fecha_inscripcion: r.fecha_inscripcion,
    clases_completadas: r.clases_completadas || 0,
    curso: {
      id: r.curso_id,
      slug: r.slug,
      titulo: r.titulo,
      url_portada: r.url_portada,
      cantidad_clases: r.cantidad_clases || 0,
      categoria: r.categoria,
    },
  }));
};

module.exports = {
  buscarInscripcion,
  verificarCursoExiste,
  crearInscripcion,
  obtenerInscripcionPorId,
  obtenerCursosPorUsuario,
};