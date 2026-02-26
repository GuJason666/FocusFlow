import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AppShell from '../components/layout/AppShell';

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
import SettingsPage from '../pages/settings/SettingsPage';

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
      { index: true, element: <Navigate to="/calendar" replace /> },
      { path: 'calendar', element: <CalendarPage /> },
      { path: 'projects', element: <ProjectsListPage /> },
      {
        path: 'projects/new',
        element: (
          <ProtectedRoute requiredRole="coach">
            <ProjectNewPage />
          </ProtectedRoute>
        ),
      },
      { path: 'projects/:id', element: <ProjectDetailPage /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'tasks/new', element: <TaskNewPage /> },
      { path: 'tasks/:id', element: <TaskDetailPage /> },
      { path: 'todos', element: <TodosPage /> },
      { path: 'todos/new', element: <TodoNewPage /> },
      { path: 'todos/:id', element: <TodoDetailPage /> },
      {
        path: 'coach',
        element: (
          <ProtectedRoute requiredRole="coach">
            <CoachDashboard />
          </ProtectedRoute>
        ),
      },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}
