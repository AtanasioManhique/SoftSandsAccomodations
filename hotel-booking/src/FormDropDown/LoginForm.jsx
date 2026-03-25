// FormDropDown/LoginForm.jsx
import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import { useTranslation } from "react-i18next";

const parseBackendError = (errorString) => {
  if (!errorString || typeof errorString !== "string") {
    return { field: null, message: "Credenciais inválidas." };
  }
  const codeMatch = errorString.match(/^\[([A-Z0-9_]+)\]\s*(.*)/);
  const code = codeMatch?.[1] ?? null;
  const humanMessage = codeMatch?.[2] ?? errorString;
  const codeMap = {
    INVALID_CREDENTIALS: null,
    ACCOUNT_DEACTIVATED: null,
    GOOGLE_ACCOUNT: null,
  };
  const field = code && code in codeMap ? codeMap[code] : null;
  const translations = {
    "Invalid email or password": "Email ou palavra-passe incorrectos.",
    "Account is deactivated": "Esta conta foi desactivada. Contacte o suporte.",
    "This account uses Google sign-in. Please log in with Google.":
      "Esta conta foi criada com Google. Por favor, utilize o botão 'Continuar com Google'.",
  };
  const message = translations[humanMessage] ?? humanMessage;
  return { field, message };
};

const LoginPage = ({ isModal = false, onSuccess }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { loginWithEmail, loginWithGoogle, loading, isAdmin } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => { const n = { ...prev }; delete n[name]; return n; });
    }
    if (generalError) setGeneralError(null);
  };

  const redirectAfterLogin = () => {
    if (isAdmin) navigate("/admin/dashboard");
    else navigate("/");
  };

  const handleFormLogin = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const clientErrors = {};
    if (!formData.email)    clientErrors.email    = "Introduza o seu email.";
    if (!formData.password) clientErrors.password = "Introduza a sua palavra-passe.";
    if (Object.keys(clientErrors).length > 0) { setFieldErrors(clientErrors); return; }
    setFieldErrors({});

    const result = await loginWithEmail(formData.email, formData.password);

    if (result?.success) {
      if (onSuccess) onSuccess();
      else redirectAfterLogin();
    } else {
      const { field, message } = parseBackendError(result?.error);
      if (field) setFieldErrors({ [field]: message });
      else setGeneralError(message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setGeneralError(null);
    try {
      const idToken = credentialResponse?.credential;
      if (!idToken) throw new Error("Google não retornou credential.");
      const result = await loginWithGoogle(idToken);
      if (result?.success) {
        if (onSuccess) onSuccess();
        else redirectAfterLogin();
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
  };

  const isLoading = loading || googleLoading;

  return (
    <div
      className={
        isModal
          ? "w-full"
          : "min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24"
      }
    >
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="Logo" className="h-16 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">
          {t("login.welcome")} SoftSands
        </h2>
        <p className="text-gray-500 mb-6 text-sm">{t("login.continue")}</p>

        <form className="flex flex-col gap-3" onSubmit={handleFormLogin}>
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

          {/* ── Link recuperar senha ── */}
          <div className="text-right -mt-1">
            <Link
              to="/recuperar-senha"
              className="text-sm text-blue-600 hover:underline"
            >
              Esqueceu a palavra-passe?
            </Link>
          </div>

          {generalError && (
            <p className="text-red-500 text-sm text-center">{generalError}</p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 mt-1"
          >
            {isLoading ? "A entrar..." : t("login.log")}
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("login.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        <div className="w-full flex justify-center">
          {googleLoading ? (
            <div className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 bg-gray-50">
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-medium text-gray-700">A entrar...</span>
            </div>
          ) : (
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={(err) => {
                console.error("Google OAuth error:", err);
                setGeneralError("Erro ao conectar com Google.");
              }}
            />
          )}
        </div>

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