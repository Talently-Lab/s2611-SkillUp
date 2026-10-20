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

// 2. GET by id or slug
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params; // Captura tanto /api/courses/1 como /api/courses/nodejs-express-desde-cero
    const course = await courseModel.obtenerPorId(id);

    // Si no existe ni por ID ni por Slug, responde con 404 limpio
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

// 3. POST (Admin)
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
    return res.status(500).json({ success: false, message: 'Error al crear el curso' });
  }
};

// 4. PUT (Admin)
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
    return res.status(500).json({ success: false, message: 'Error al actualizar el curso' });
  }
};

// 5. DELETE (Admin)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
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
    return res.status(500).json({ success: false, message: 'Error al eliminar el curso' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
};