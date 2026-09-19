import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
import AuthLayout from './layouts/AuthLayout'
import AdminLayout from './layouts/AdminLayout'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import CourseDetail from './pages/CourseDetail'
import Dashboard from './pages/Dashboard'
import EnrolledCourse from './pages/EnrolledCourse'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import AdminCourses from './pages/AdminCourses'
import AdminCourseForm from './pages/AdminCourseForm'
import AdminUsers from './pages/AdminUsers'
import ErrorPage from './pages/ErrorPage'

// TODO(FE-13): /mis-cursos, /perfil y /admin (y sus subrutas) van a ir protegidas.
export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'cursos', element: <Catalog /> },
      { path: 'cursos/:slug', element: <CourseDetail /> },
      { path: 'mis-cursos', element: <Dashboard /> },
      { path: 'mis-cursos/:slug', element: <EnrolledCourse /> },
      { path: 'perfil', element: <Profile /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'registro', element: <Register /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/admin/cursos" replace /> },
      { path: 'cursos', element: <AdminCourses /> },
      { path: 'cursos/nuevo', element: <AdminCourseForm /> },
      { path: 'cursos/:id/editar', element: <AdminCourseForm /> },
      { path: 'usuarios', element: <AdminUsers /> },
    ],
  },
])
