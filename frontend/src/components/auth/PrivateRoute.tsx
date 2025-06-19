import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Layout from '../layout/Layout';

interface PrivateRouteProps {
  requiredRole?: 'admin' | 'editor' | 'viewer';
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ requiredRole }) => {
  const { authState } = useAuth();
  const location = useLocation();

  // Check if user is authenticated
  if (!authState.isAuthenticated) {
    // Redirect to login page but save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user has required role
  if (requiredRole && authState.user) {
    const userRole = authState.user.role;
    
    // Role hierarchy: admin > editor > viewer
    if (
      (requiredRole === 'admin' && userRole !== 'admin') ||
      (requiredRole === 'editor' && userRole !== 'admin' && userRole !== 'editor')
    ) {
      // Redirect to unauthorized page
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // If authenticated and has required role, render the protected route
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

export default PrivateRoute;
