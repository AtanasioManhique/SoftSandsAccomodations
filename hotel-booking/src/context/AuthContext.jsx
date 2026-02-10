import { createContext, useEffect, useState, useContext } from "react";
import { api } from "../services/api";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [loading, setLoading] = useState(false);

  // ✅ LOGIN — versão atual (mock) + suporte futuro backend
  const login = async (userData, token) => {
    setLoading(true);
    try {
      // ✅ FUTURO: login real
      /*
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      setUser(res.data.user);
      */

      // ✅ AGORA: login local sem backend
      localStorage.setItem("user", JSON.stringify(userData));
      if (token) localStorage.setItem("token", token);

      setUser(userData);

      window.dispatchEvent(new Event("user_logged_in"));
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user_logged_in"));
    navigate("/");
  };

  // ✅ isAdmin pronto pro futuro
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
