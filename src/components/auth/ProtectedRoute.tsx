import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppRole } from '../../types/database';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading, isPendingApproval } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isPendingApproval) {
    return <Navigate to="/pending-approval" replace />;
  }

  return <>{children}</>;
};

export const RoleRoute: React.FC<{ roles: AppRole[]; children: React.ReactNode }> = ({
  roles,
  children
}) => {
  const { role } = useAuth();

  if (!role || !roles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
