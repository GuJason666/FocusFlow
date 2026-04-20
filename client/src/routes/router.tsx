import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';
import { useAuthStore } from '../store/useAuthStore';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import ProjectsListPage from '../pages/projects/ProjectsListPage';
import ProjectDetailPage from '../pages/projects/ProjectDetailPage';
import ProjectNewPage from '../pages/projects/ProjectNewPage';
import TasksPage from '../pages/tasks/TasksPage';
import TaskNewPage from '../pages/tasks/TaskNewPage';
import TaskDetailPage from '../pages/tasks/TaskDetailPage';
import TodosPage from '../pages/todos/TodosPage';
import TodoNewPage from '../pages/todos/TodoNewPage';
import TodoDetailPage from '../pages/todos/TodoDetailPage';
import CoachDashboard from '../pages/coach/CoachDashboard';
import StudentsPage from '../pages/coach/StudentsPage';
import SettingsPage from '../pages/settings/SettingsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import CoursesPage from '../pages/courses/CoursesPage';
import CourseNewPage from '../pages/courses/CourseNewPage';
import CourseDetailPage from '../pages/courses/CourseDetailPage';

function RoleRedirect() {
  const user = useAuthStore((s) => s.user);
  return <Navigate to={user?.role === 'coach' ? '/students' : '/dashboard'} replace />;
}

const router = createBrowserRouter([
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <RoleRedirect /> },

      // Student-only routes
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute forbiddenRole="coach"><DashboardPage /></ProtectedRoute>
        ),
      },
      {
        path: 'calendar',
        element: (
          <ProtectedRoute forbiddenRole="coach"><CalendarPage /></ProtectedRoute>
        ),
      },
      {
        path: 'projects',
        element: (
          <ProtectedRoute forbiddenRole="coach"><ProjectsListPage /></ProtectedRoute>
        ),
      },
      {
        path: 'projects/new',
        element: (
          <ProtectedRoute forbiddenRole="coach"><ProjectNewPage /></ProtectedRoute>
        ),
      },
      {
        path: 'projects/:id',
        element: (
          <ProtectedRoute forbiddenRole="coach"><ProjectDetailPage /></ProtectedRoute>
        ),
      },
      {
        path: 'tasks',
        element: (
          <ProtectedRoute forbiddenRole="coach"><TasksPage /></ProtectedRoute>
        ),
      },
      {
        path: 'tasks/new',
        element: (
          <ProtectedRoute forbiddenRole="coach"><TaskNewPage /></ProtectedRoute>
        ),
      },
      {
        path: 'tasks/:id',
        element: (
          <ProtectedRoute forbiddenRole="coach"><TaskDetailPage /></ProtectedRoute>
        ),
      },
      {
        path: 'courses',
        element: (
          <ProtectedRoute forbiddenRole="coach"><CoursesPage /></ProtectedRoute>
        ),
      },
      {
        path: 'courses/new',
        element: (
          <ProtectedRoute forbiddenRole="coach"><CourseNewPage /></ProtectedRoute>
        ),
      },
      {
        path: 'courses/:id',
        element: (
          <ProtectedRoute forbiddenRole="coach"><CourseDetailPage /></ProtectedRoute>
        ),
      },

      // Shared routes
      { path: 'todos', element: <TodosPage /> },
      { path: 'todos/new', element: <TodoNewPage /> },
      { path: 'todos/:id', element: <TodoDetailPage /> },
      { path: 'settings', element: <SettingsPage /> },

      // Coach-only routes
      {
        path: 'students',
        element: (
          <ProtectedRoute requiredRole="coach"><StudentsPage /></ProtectedRoute>
        ),
      },
      {
        path: 'coach',
        element: (
          <ProtectedRoute requiredRole="coach"><CoachDashboard /></ProtectedRoute>
        ),
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
