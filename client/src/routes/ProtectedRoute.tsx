import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'coach' | 'student';
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/calendar" replace />;
  }

  return <>{children}</>;
}
