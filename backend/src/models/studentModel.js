const db = require('../config/db');

// 1. Obtener curso y validar que el alumno tenga inscripción activa
const obtenerCursoEInscripcion = async (idUsuario, slug) => {
  const query = `
    SELECT 
      c.id AS id_curso, 
      c.titulo, 
      c.descripcion, 
      c.slug,
      i.id AS id_inscripcion
    FROM cursos c
    JOIN inscripciones i ON i.id_curso = c.id
    WHERE c.slug = $1 
      AND i.id_usuario = $2 
      AND i.estado = 'activa';
  `;
  const { rows } = await db.query(query, [slug, idUsuario]);
  return rows[0] || null;
};

// 2. Obtener clases cruzando con la inscripción y transformando completada_en a booleano
const obtenerClasesConProgreso = async (idInscripcion, idCurso) => {
  const query = `
    SELECT 
      cl.id,
      cl.titulo,
      cl.orden,
      cl.descripcion,
      cl.contenido_texto AS contenido,
      cl.url_externa,
      (pc.completada_en IS NOT NULL) AS completada
    FROM clases cl
    LEFT JOIN progreso_clases pc 
      ON pc.id_clase = cl.id AND pc.id_inscripcion = $1
    WHERE cl.id_curso = $2
    ORDER BY cl.orden ASC;
  `;
  const { rows } = await db.query(query, [idInscripcion, idCurso]);
  return rows;
};

// 3. Buscar la inscripción activa asociada a la clase que se quiere completar
const obtenerInscripcionPorClase = async (idUsuario, idClase) => {
  const query = `
    SELECT i.id AS id_inscripcion
    FROM clases cl
    JOIN inscripciones i ON i.id_curso = cl.id_curso
    WHERE cl.id = $1 
      AND i.id_usuario = $2 
      AND i.estado = 'activa';
  `;
  const { rows } = await db.query(query, [idClase, idUsuario]);
  return rows[0] || null;
};

// 4. Registrar o actualizar la fecha de completado en progreso_clases
const registrarProgreso = async (idInscripcion, idClase) => {
  const query = `
    INSERT INTO progreso_clases (id_inscripcion, id_clase, completada_en)
    VALUES ($1, $2, NOW())
    ON CONFLICT (id_inscripcion, id_clase)
    DO UPDATE SET completada_en = NOW()
    RETURNING id, id_inscripcion, id_clase, completada_en;
  `;
  const { rows } = await db.query(query, [idInscripcion, idClase]);
  return rows[0];
};

module.exports = {
  obtenerCursoEInscripcion,
  obtenerClasesConProgreso,
  obtenerInscripcionPorClase,
  registrarProgreso,
};