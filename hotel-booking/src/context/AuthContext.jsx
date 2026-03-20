// src/context/AuthContext.jsx
import { createContext, useContext, useMemo, useState } from "react";
import api from "../services/api.js";

const AuthContext = createContext(null);

// ─────────────────────────────────────────────────────────────
// 🚧 DEV ONLY — Credenciais temporárias para simular admin
// Remove este bloco quando o backend estiver pronto.
//
// Para entrar como admin usa:
//   Email:    admin@softsands.com
//   Password: admin123
// ─────────────────────────────────────────────────────────────
const DEV_ADMIN = {
  id:      "dev-admin-001",
  name:    "Admin SoftSands",
  email:   "admin@softsands.com",
  role:    "admin",
  picture: null,
};
const DEV_ADMIN_EMAIL    = "admin@softsands.com";
const DEV_ADMIN_PASSWORD = "admin123";
// ─────────────────────────────────────────────────────────────

const unpack = (res) => res?.data?.data ?? res?.data ?? null;

const errorToString = (err) => {
  const data = err?.response?.data;
  if (data && typeof data === "object") {
    const root = data.error && typeof data.error === "object" ? data.error : data;
    const code = root.code ? `[${root.code}] ` : "";
    const message = typeof root.message === "string" ? root.message : "Ocorreu um erro.";
    let details = "";
    if (root.details != null) {
      details =
        typeof root.details === "string"
          ? root.details
          : Array.isArray(root.details)
          ? root.details.map((d) => d?.message || JSON.stringify(d)).join(" | ")
          : typeof root.details === "object"
          ? JSON.stringify(root.details)
          : String(root.details);
    }
    return `${code}${message}${details ? ` — ${details}` : ""}`;
  }
  return err?.message || "Ocorreu um erro.";
};

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

  const saveAuth = (userData, accessToken, refreshToken) => {
    if (accessToken)  localStorage.setItem("token",        accessToken);
    if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
    if (userData)     localStorage.setItem("user",         JSON.stringify(userData));
    setUser(userData || null);
    window.dispatchEvent(new Event("user_logged_in"));
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user_logged_in"));
  };

  // ───────────────────────────────────────────────────────────
  // LOGIN (EMAIL)
  // ───────────────────────────────────────────────────────────
  const loginWithEmail = async (email, password) => {
    setLoading(true);
    try {

      // 🚧 DEV — Simula login de admin sem backend
      // Remove este bloco quando o backend estiver pronto.
      if (
        email.trim().toLowerCase()    === DEV_ADMIN_EMAIL &&
        password                       === DEV_ADMIN_PASSWORD
      ) {
        saveAuth(DEV_ADMIN, "dev-token-admin", "dev-refresh-admin");
        return { success: true };
      }
      // 🚧 fim do bloco DEV ──────────────────────────────────

      // BACKEND: POST /api/auth/login
      const res = await api.post("/auth/login", { email, password });
      const payload = unpack(res);

      const userData     = payload?.user;
      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;

      if (!userData || !accessToken) {
        throw new Error("Resposta inválida do servidor (token/user).");
      }

      saveAuth(userData, accessToken, refreshToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorToString(err) };
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // REGISTER
  // ───────────────────────────────────────────────────────────
  const register = async (formData) => {
    setLoading(true);
    try {
      return { success: true }; // 🚧 DEV — remove quando o backend estiver pronto

      const res = await api.post("/auth/register", {
        name:            formData.name,
        email:           formData.email,
        password:        formData.password,
        confirmPassword: formData.confirmPassword,
        country:         formData.country,
      });

      const payload      = unpack(res);
      const userData     = payload?.user;
      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;

      if (!userData || !accessToken) {
        throw new Error("Resposta inválida do servidor (token/user).");
      }

      saveAuth(userData, accessToken, refreshToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorToString(err) };
    } finally {
      setLoading(false);
    }
  };

  // ───────────────────────────────────────────────────────────
  // GOOGLE AUTH
  // ───────────────────────────────────────────────────────────
  const loginWithGoogle = async (idToken) => {
    setLoading(true);
    try {
      const res = await api.post("/auth/google", { idToken });
      const payload = unpack(res);

      const userData     = payload?.user;
      const accessToken  = payload?.tokens?.accessToken;
      const refreshToken = payload?.tokens?.refreshToken;

      if (!userData || !accessToken) {
        throw new Error("Resposta inválida do servidor (token/user).");
      }

      saveAuth(userData, accessToken, refreshToken);
      return { success: true };
    } catch (err) {
      return { success: false, error: errorToString(err) };
    } finally {
      setLoading(false);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === "admin",
      loginWithEmail,
      loginWithGoogle,
      register,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);