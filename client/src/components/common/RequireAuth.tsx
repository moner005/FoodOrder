
import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStores';

interface RequireAuthProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export function RequireAuth({
  children,
  allowedRoles,
}: RequireAuthProps) {
  const user = useAuthStore((state) => state.user);
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  if (
    allowedRoles &&
    !allowedRoles.includes(user.role ?? '')
  ) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
