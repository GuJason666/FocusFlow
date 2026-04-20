import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

interface Props {
  children: React.ReactNode;
  requiredRole?: 'coach' | 'student';
  forbiddenRole?: 'coach' | 'student';
}

export default function ProtectedRoute({ children, requiredRole, forbiddenRole }: Props) {
  const { user, token } = useAuthStore();
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'coach' ? '/students' : '/dashboard'} replace />;
  }

  if (forbiddenRole && user.role === forbiddenRole) {
    return <Navigate to={user.role === 'coach' ? '/students' : '/dashboard'} replace />;
  }

  return <>{children}</>;
}
