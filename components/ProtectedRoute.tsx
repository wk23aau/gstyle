
import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isLoggedIn: boolean;
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    // User not logged in, redirect them to the home page.
    // Optionally, you could pass state here to show a message on the home page
    // or trigger the login modal, but for now, a simple redirect.
    return <Navigate to="/" replace />;
  }

  return children; // User is logged in, render the protected component
};

export default ProtectedRoute;