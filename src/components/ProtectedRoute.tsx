import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('user' | 'rider' | 'admin')[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="font-display text-sm font-medium text-gray-500">Checking credentials, please wait...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    // Save previous route to redirect them back on successful login success.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If user level doesn't match, bounce to their matching dashboard
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'rider') return <Navigate to="/rider" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
