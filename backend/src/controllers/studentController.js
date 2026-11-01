const studentModel = require('../models/studentModel');

// GET /api/mis-cursos/:slug
const obtenerClasesCurso = async (req, res, next) => {
  try {
    const idUsuario = req.user.id;
    const { slug } = req.params;

    const cursoInscripto = await studentModel.obtenerCursoEInscripcion(idUsuario, slug);
    if (!cursoInscripto) {
      return res.status(404).json({
        error: 'No encontrado',
        mensaje: 'No estás inscripto en este curso o el curso no existe.',
      });
    }

    const clases = await studentModel.obtenerClasesConProgreso(
      cursoInscripto.id_inscripcion,
      cursoInscripto.id_curso
    );

    return res.status(200).json({
      curso: {
        id: cursoInscripto.id_curso,
        titulo: cursoInscripto.titulo,
        descripcion: cursoInscripto.descripcion,
        slug: cursoInscripto.slug,
        clases,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/progreso
const marcarProgresoClase = async (req, res, next) => {
  try {
    const idUsuario = req.user.id;
    const { id_clase } = req.body;

    if (!id_clase) {
      return res.status(400).json({
        error: 'Datos incompletos',
        mensaje: 'El id_clase es obligatorio.',
      });
    }

    // Valida que el alumno realmente esté cursando la materia a la que pertenece esa clase
    const inscripcion = await studentModel.obtenerInscripcionPorClase(idUsuario, id_clase);
    if (!inscripcion) {
      return res.status(403).json({
        error: 'Acceso denegado',
        mensaje: 'No tienes una inscripción activa para el curso de esta clase.',
      });
    }

    const progreso = await studentModel.registrarProgreso(inscripcion.id_inscripcion, id_clase);

    return res.status(200).json({
      mensaje: 'Clase completada con éxito',
      progreso: {
        ...progreso,
        completada: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  obtenerClasesCurso,
  marcarProgresoClase,
};