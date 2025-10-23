import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { authContext } from "../context/AuthContext";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { token, role } = useContext(authContext);

  // If no token, redirect to login
  if (!token) {
    return <Navigate to="/login" replace={true} />;
  }

  // If no specific roles are required, allow access
  if (!allowedRoles || allowedRoles.length === 0) {
    return children;
  }

  // If specific roles are required, check if user role matches
  const userRole = role?.toLowerCase().replace('_', '');
  const isAllowed = allowedRoles.some(allowedRole =>
    allowedRole.toLowerCase() === userRole
  );

  if (!isAllowed) {
    return <Navigate to="/login" replace={true} />;
  }

  return children;
};

export default ProtectedRoute;
