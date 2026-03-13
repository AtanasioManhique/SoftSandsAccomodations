// FormDropDown/LoginForm.jsx
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import { useTranslation } from "react-i18next";

// ─────────────────────────────────────────────────────────────
// Códigos de erro reais do backend (auth.service.js / auth.controller.js):
//   INVALID_CREDENTIALS  → 401 — email ou password errados
//   ACCOUNT_DEACTIVATED  → 401 — conta desactivada
//   GOOGLE_ACCOUNT       → 401 — conta criada via Google, sem password
//
// O AuthContext converte esses erros no formato:
//   "[INVALID_CREDENTIALS] Invalid email or password"
// Esta função extrai o código e mapeia para o campo correcto.
// ─────────────────────────────────────────────────────────────
const parseBackendError = (errorString) => {
  if (!errorString || typeof errorString !== "string") {
    return { field: null, message: "Credenciais inválidas." };
  }

  // Extrai código: "[INVALID_CREDENTIALS] mensagem" → code + humanMessage
  const codeMatch = errorString.match(/^\[([A-Z0-9_]+)\]\s*(.*)/);
  const code = codeMatch?.[1] ?? null;
  const humanMessage = codeMatch?.[2] ?? errorString;

  // Mapa código → campo do formulário (null = erro geral)
  const codeMap = {
    INVALID_CREDENTIALS: null,   // genérico — não especifica email nem password (segurança)
    ACCOUNT_DEACTIVATED: null,   // erro geral
    GOOGLE_ACCOUNT:      null,   // erro geral — sugere usar Google
  };

  const field = code && code in codeMap ? codeMap[code] : null;

  // Traduz as mensagens do backend (em inglês) para português
  const translations = {
    "Invalid email or password":
      "Email ou palavra-passe incorrectos.",
    "Account is deactivated":
      "Esta conta foi desactivada. Contacte o suporte.",
    "This account uses Google sign-in. Please log in with Google.":
      "Esta conta foi criada com Google. Por favor, utilize o botão 'Continuar com Google'.",
  };

  const message = translations[humanMessage] ?? humanMessage;

  return { field, message };
};

// ─────────────────────────────────────────────────────────────

const LoginPage = ({ isModal = false, onSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginWithEmail, loginWithGoogle, loading } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Limpa o erro do campo assim que o utilizador começa a corrigir
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    if (generalError) setGeneralError(null);
  };

  // ── Login por formulário ──────────────────────────────────
  const handleFormLogin = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    // Validação client-side mínima (UX)
    const clientErrors = {};
    if (!formData.email)    clientErrors.email    = "Introduza o seu email.";
    if (!formData.password) clientErrors.password = "Introduza a sua palavra-passe.";
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});

    // Chamada ao backend — POST /api/auth/login { email, password }
    const result = await loginWithEmail(formData.email, formData.password);

    if (result?.success) {
      if (onSuccess) onSuccess();
      else navigate("/");
    } else {
      const { field, message } = parseBackendError(result?.error);
      if (field) setFieldErrors({ [field]: message });
      else setGeneralError(message);
    }
  };

  // ── Login Google via popup ────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setGeneralError(null);
      try {
        const googleAccessToken = tokenResponse?.access_token;
        if (!googleAccessToken) throw new Error("Google não retornou access_token.");
        const result = await loginWithGoogle(googleAccessToken);
        if (result?.success) {
          if (onSuccess) onSuccess();
          else navigate("/");
        } else {
          const { message } = parseBackendError(result?.error);
          setGeneralError(message);
        }
      } catch (err) {
        console.error("Erro Google login:", err);
        setGeneralError(err?.message || "Erro ao processar login com Google.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: (err) => {
      console.error("Google OAuth error:", err);
      setGeneralError("Erro ao conectar com Google.");
    },
  });

  const isLoading = loading || googleLoading;

  return (
    <div className={
      isModal
        ? "w-full"
        : "min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24"
    }>
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {t("login.welcome")} SoftSands
        </h2>
        <p className="text-gray-500 mb-6 text-sm">{t("login.continue")}</p>

        <form className="flex flex-col gap-3" onSubmit={handleFormLogin}>
          {/* Email */}
          <div className="flex flex-col gap-1 text-left">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className={`border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors ${
                fieldErrors.email
                  ? "border-red-400 focus:ring-red-300 bg-red-50"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {fieldErrors.email && (
              <p className="text-red-500 text-xs px-1">{fieldErrors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1 text-left">
            <input
              type="password"
              name="password"
              placeholder={t("login.pass")}
              value={formData.password}
              onChange={handleChange}
              required
              className={`border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors ${
                fieldErrors.password
                  ? "border-red-400 focus:ring-red-300 bg-red-50"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {fieldErrors.password && (
              <p className="text-red-500 text-xs px-1">{fieldErrors.password}</p>
            )}
          </div>

          {/* Erro geral */}
          {generalError && (
            <p className="text-red-500 text-sm text-center">{generalError}</p>
          )}

          <button type="submit" disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 mt-1">
            {isLoading ? "A entrar..." : t("login.log")}
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("login.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        <button onClick={() => handleGoogleLogin()} disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {googleLoading
            ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            : <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
          }
          <span className="text-sm font-medium text-gray-700">
            {googleLoading ? "A entrar..." : "Continuar com Google"}
          </span>
        </button>

        <p className="mt-6 text-sm text-gray-600">
          {t("login.acc")}{" "}
          <a href="/signup" className="text-blue-600 hover:underline">
            {t("login.create")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;