// src/components/ProtectedAdminRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedAdminRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  // Aguarda o AuthContext carregar o user do localStorage
  if (loading) return null;

  // isAdmin já está calculado no AuthContext: user?.role === "admin"
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedAdminRoute;