// src/controllers/course.controller.js

// Simulamos una "base de datos" en memoria para el ejemplo
let courses = [
    { id: 1, title: "Introducción a Node.js", description: "Backend básico", instructor: "Ana", price: 49 },
    { id: 2, title: "PostgreSQL Avanzado", description: "Bases de datos relacionales", instructor: "Carlos", price: 59 }
];

// 1. GET all
export const getAllCourses = (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 2. GET by id
export const getCourseById = (req, res) => {
    try {
        const { id } = req.params;
        const course = courses.find(c => c.id === parseInt(id));

        if (!course) {
            return res.status(404).json({ success: false, message: "Curso no encontrado" });
        }

        return res.status(200).json({ success: true, data: course });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 3. POST (Admin)
export const createCourse = (req, res) => {
    try {
        const { title, description, instructor, price } = req.body;

        if (!title || !price) {
            return res.status(400).json({ success: false, message: "El título y el precio son obligatorios" });
        }

        const newCourse = {
            id: courses.length > 0 ? courses[courses.length - 1].id + 1 : 1,
            title,
            description,
            instructor,
            price,
            createdAt: new Date().toISOString()
        };

        courses.push(newCourse);

        return res.status(201).json({
            success: true,
            message: "Curso creado exitosamente",
            data: newCourse
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 4. PUT (Admin)
export const updateCourse = (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, instructor, price } = req.body;

        const courseIndex = courses.findIndex(c => c.id === parseInt(id));

        if (courseIndex === -1) {
            return res.status(404).json({ success: false, message: "Curso no encontrado" });
        }

        courses[courseIndex] = {
            ...courses[courseIndex],
            title: title || courses[courseIndex].title,
            description: description || courses[courseIndex].description,
            instructor: instructor || courses[courseIndex].instructor,
            price: price !== undefined ? price : courses[courseIndex].price
        };

        return res.status(200).json({
            success: true,
            message: "Curso actualizado exitosamente",
            data: courses[courseIndex]
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

// 5. DELETE (Admin)
export const deleteCourse = (req, res) => {
    try {
        const { id } = req.params;
        const courseIndex = courses.findIndex(c => c.id === parseInt(id));

        if (courseIndex === -1) {
            return res.status(404).json({ success: false, message: "Curso no encontrado" });
        }

        const deletedCourse = courses.splice(courseIndex, 1);

        return res.status(200).json({
            success: true,
            message: "Curso eliminado exitosamente",
            data: deletedCourse[0]
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};