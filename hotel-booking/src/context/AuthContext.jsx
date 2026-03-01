// context/AuthContext.jsx
// ─────────────────────────────────────────────────────────────
// Contexto de autenticação global.
// Gere o estado do utilizador, login, logout e Google Auth.
// Funciona agora com mock local.
// Quando o backend estiver pronto, substituir os blocos MOCK.
// ─────────────────────────────────────────────────────────────

import { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  // ── LOGIN ─────────────────────────────────────────────────
  const login = (userData, token) => {
    // ─────────────────────────────────────────────────────
    // BACKEND: Substituir por validação do token no servidor.
    // O token JWT virá do backend após autenticação.
    // Exemplo:
    // const res = await api.post("/auth/login", { email, password });
    // const { token, user } = res.data;
    // ─────────────────────────────────────────────────────
    localStorage.setItem("user", JSON.stringify(userData));
    if (token) localStorage.setItem("token", token);
    setUser(userData);
    window.dispatchEvent(new Event("user_logged_in"));
  };

  // ── LOGIN GOOGLE ──────────────────────────────────────────
  const loginWithGoogle = async (googleToken, decodedUser) => {
    setLoading(true);
    try {
      // ─────────────────────────────────────────────────────
      // MOCK: Usa os dados decodificados do JWT do Google
      // diretamente, sem validar no backend.
      // ─────────────────────────────────────────────────────
      const userData = {
        name: decodedUser.name,
        email: decodedUser.email,
        picture: decodedUser.picture,
        role: "user",
        provider: "google",
      };

      login(userData, googleToken);
      return { success: true };

      // ─────────────────────────────────────────────────────
      // BACKEND: Comentar o MOCK acima e descomentar isto.
      // O backend valida o token Google e devolve um JWT próprio.
      // const res = await api.post("/auth/google", { token: googleToken });
      // const { user, token } = res.data;
      // login(user, token);
      // return { success: true };
      // ─────────────────────────────────────────────────────
    } catch (err) {
      console.error("Erro Google login:", err);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // ── REGISTER ──────────────────────────────────────────────
  const register = async (formData) => {
    setLoading(true);
    try {
      // ─────────────────────────────────────────────────────
      // MOCK: Cria utilizador local sem chamar o backend.
      // ─────────────────────────────────────────────────────
      const mockUser = {
        name: formData.name,
        email: formData.email,
        city: formData.city || "",
        role: "user",
        provider: "email",
      };

      login(mockUser, `mock_token_${Date.now()}`);
      return { success: true };

      // ─────────────────────────────────────────────────────
      // BACKEND: Comentar o MOCK acima e descomentar isto.
      // const res = await api.post("/auth/register", {
      //   name: formData.name,
      //   email: formData.email,
      //   password: formData.password,
      //   city: formData.city,
      // });
      // const { token, user } = res.data;
      // login(user, token);
      // return { success: true };
      // ─────────────────────────────────────────────────────
    } catch (err) {
      console.error("Erro register:", err);
      return { success: false, error: err.message || "Erro ao criar conta." };
    } finally {
      setLoading(false);
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user_logged_in"));
    // ─────────────────────────────────────────────────────
    // BACKEND: Adicionar invalidação de sessão no servidor.
    // await api.post("/auth/logout");
    // ─────────────────────────────────────────────────────
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        loginWithGoogle,
        register,
        logout,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);