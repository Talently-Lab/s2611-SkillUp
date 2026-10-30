// src/controllers/course.controller.js
// src/controllers/course.controller.js
const courseModel = require('../models/courseModel');

// 1. GET all
const getAllCourses = async (req, res) => {
  try {
    const courses = await courseModel.obtenerTodos();
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error en getAllCourses:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};
// 1.1 GET all for Admin (includes drafts)
const getAllCoursesAdmin = async (req, res) => {
  try {
    const courses = await courseModel.obtenerTodosAdmin();
    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error('Error en getAllCoursesAdmin:', error);
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

// 2. GET by id or slug
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await courseModel.obtenerPorId(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
      });
    }

    return res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error('Error en getCourseById:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
    });
  }
};

// 3. POST (Admin) - Captura slug duplicado -> 409
const createCourse = async (req, res) => {
  try {
    const { titulo, descripcion, slug, categoria, nivel, resumen, url_portada } = req.body;

    if (!titulo || !slug) {
      return res.status(400).json({ success: false, message: 'El título y el slug son obligatorios' });
    }

    const newCourse = await courseModel.crear({
      titulo,
      descripcion,
      slug,
      categoria,
      nivel,
      resumen,
      url_portada,
    });

    return res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: newCourse,
    });
  } catch (error) {
    console.error('Error en createCourse:', error);

    // Atrapamos el error de duplicidad de Postgres (Unique violation)
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un curso con ese slug, probá con otro',
      });
    }

    return res.status(500).json({ success: false, message: 'Error al crear el curso' });
  }
};

// 4. PUT (Admin) - También captura slug duplicado al actualizar -> 409
const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedCourse = await courseModel.actualizar(id, req.body);

    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    return res.status(200).json({
      success: true,
      message: 'Curso actualizado exitosamente',
      data: updatedCourse,
    });
  } catch (error) {
    console.error('Error en updateCourse:', error);

    // Atrapamos también aquí si repiten el slug al editar
    if (error.code === '23505') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un curso con ese slug, probá con otro',
      });
    }

    return res.status(500).json({ success: false, message: 'Error al actualizar el curso' });
  }
};

// 5. DELETE (Admin) - Bloquea si tiene alumnos inscriptos -> 409, creado temporalmente la idea seria hacer un borrado logico.
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Verificar si el curso tiene alumnos inscriptos antes de borrar
    const tieneInscriptos = await courseModel.verificarAlumnosInscriptos(id); // (Función que cuenta inscripciones)
    if (tieneInscriptos) {
      return res.status(409).json({
        success: false,
        message: 'No se puede eliminar el curso porque tiene alumnos inscriptos.',
      });
    }

    // 2. Si no tiene alumnos, procede a borrar normalmente
    const deletedCourse = await courseModel.eliminar(id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: 'Curso no encontrado' });
    }

    return res.status(200).json({
      success: true,
      message: 'Curso eliminado exitosamente',
      data: deletedCourse,
    });
  } catch (error) {
    console.error('Error en deleteCourse:', error);
    return res.status(409).json({ success: false, message: 'Error al eliminar el curso' });
  }
};

module.exports = {
  getAllCourses,
  getAllCoursesAdmin,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};