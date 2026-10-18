// backend/src/controllers/enrollmentController.js
const enrollmentModel = require('../models/enrollmentModel');

// POST /api/enrollments -> Inscribirse a un curso
const inscribir = async (req, res) => {
  try {
    const idUsuario = req.user?.id;
    // Acepta course_id según el contrato del frontend (o variantes por compatibilidad)
    const idCurso = req.body.course_id || req.body.curso_id || req.body.id_curso || req.body.id;

    if (!idCurso) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'El campo course_id es obligatorio',
      });
    }

    // Verificar si el curso existe
    const curso = await enrollmentModel.verificarCursoExiste(idCurso);
    if (!curso) {
      return res.status(404).json({
        error: 'No encontrado',
        mensaje: 'El curso especificado no existe',
      });
    }

    // Regla de negocio en backend: rechazar duplicados
    const yaInscripto = await enrollmentModel.buscarInscripcion(idUsuario, idCurso);
    if (yaInscripto) {
      return res.status(409).json({
        error: 'Conflicto',
        mensaje: 'Ya te encuentras inscripto en este curso',
      });
    }

    // Insertar en la base de datos
    const inscripcionCreada = await enrollmentModel.crearInscripcion(idUsuario, idCurso);

    // Obtener la inscripción con los datos completos del curso requeridos por Frontend
    const resultadoCompleto = await enrollmentModel.obtenerInscripcionPorId(inscripcionCreada.id);

    return res.status(201).json(resultadoCompleto);
  } catch (error) {
    console.error('Error en inscribir:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      mensaje: 'No se pudo procesar la inscripción',
    });
  }
};

// GET /api/enrollments/me -> Listar cursos del usuario logueado
const obtenerMisCursos = async (req, res) => {
  try {
    const idUsuario = req.user?.id;
    const inscripciones = await enrollmentModel.obtenerCursosPorUsuario(idUsuario);

    // Formato exacto requerido por el frontend: { datos: [ ... ] }
    return res.status(200).json({
      datos: inscripciones,
    });
  } catch (error) {
    console.error('Error en obtenerMisCursos:', error);
    return res.status(500).json({
      error: 'Error del servidor',
      mensaje: 'No se pudieron obtener las inscripciones',
    });
  }
};

module.exports = {
  inscribir,
  obtenerMisCursos,
};