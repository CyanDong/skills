import type { ReactNode } from 'react';
import type { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import Dashboard from '../pages/Dashboard';
import Users from '../pages/Users';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/login',
    element: <Login />
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <Dashboard />
      },
      {
        path: 'users',
        element: <Users />
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
];
