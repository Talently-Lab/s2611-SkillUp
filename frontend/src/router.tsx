import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from './layouts/AppLayout'
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
import UiKit from './pages/UiKit'
import RutaProtegida from './components/auth/RutaProtegida'
import SoloInvitados from './components/auth/SoloInvitados'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: 'cursos', element: <Catalog /> },
      { path: 'cursos/:slug', element: <CourseDetail /> },
      {
        element: <RutaProtegida />,
        children: [
          { path: 'mis-cursos', element: <Dashboard /> },
          { path: 'mis-cursos/:slug', element: <EnrolledCourse /> },
          { path: 'perfil', element: <Profile /> },
        ],
      },
      { path: 'ui', element: <UiKit /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  // Login y Registro arman su propio AuthLayout porque le pasan título y bajada
  {
    element: <SoloInvitados />,
    errorElement: <ErrorPage />,
    children: [
      { path: 'login', element: <Login />, errorElement: <ErrorPage /> },
      { path: 'registro', element: <Register />, errorElement: <ErrorPage /> },
    ],
  },
  {
    // El control de rol va arriba de AdminLayout para que un alumno nunca
    // llegue a renderizar el layout de admin, ni por un instante.
    path: 'admin',
    element: <RutaProtegida roles={['admin']} />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <Navigate to="/admin/cursos" replace /> },
          { path: 'cursos', element: <AdminCourses /> },
          { path: 'cursos/nuevo', element: <AdminCourseForm /> },
          { path: 'cursos/:id/editar', element: <AdminCourseForm /> },
          { path: 'usuarios', element: <AdminUsers /> },
        ],
      },
    ],
  },
])
