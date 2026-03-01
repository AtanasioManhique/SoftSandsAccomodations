// FormDropDown/LoginForm.jsx
// ─────────────────────────────────────────────────────────────
// Usa useGoogleLogin com flow "implicit" (popup) em vez do
// componente <GoogleLogin /> que usa iframe.
// O iframe é bloqueado pelo Google (403) quando está dentro
// de modais ou contextos com restrições de segurança —
// o que causa o problema no mobile.
// O popup funciona em qualquer contexto.
// ─────────────────────────────────────────────────────────────

import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import { useTranslation } from "react-i18next";

const LoginPage = ({ isModal = false, onSuccess }) => {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loading } = useAuth();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // ── Login por formulário ──────────────────────────────────
  const handleFormLogin = async (e) => {
    e.preventDefault();
    setError(null);

    // ─────────────────────────────────────────────────────
    // MOCK: Cria utilizador fake com o email introduzido.
    // ─────────────────────────────────────────────────────
    const mockUser = {
      name: formData.email.split("@")[0],
      email: formData.email,
      role: "user",
      provider: "email",
    };
    login(mockUser, `mock_token_${Date.now()}`);

    // ─────────────────────────────────────────────────────
    // BACKEND: Comentar o MOCK acima e descomentar isto.
    // const res = await api.post("/auth/login", {
    //   email: formData.email,
    //   password: formData.password,
    // });
    // if (!res.ok) { setError("Email ou palavra-passe incorretos."); return; }
    // const { user, token } = res.data;
    // login(user, token);
    // ─────────────────────────────────────────────────────

    if (onSuccess) onSuccess();
    else navigate("/");
  };

  // ── Login Google via popup ────────────────────────────────
  // useGoogleLogin abre um popup nativo do browser em vez de
  // um iframe — funciona em desktop e mobile sem erros 403.
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",

    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      try {
        // Buscar dados do perfil com o access token
        const profileRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!profileRes.ok) throw new Error("Erro ao obter perfil Google.");

        const profile = await profileRes.json();

        const result = await loginWithGoogle(tokenResponse.access_token, {
          name: profile.name,
          email: profile.email,
          picture: profile.picture,
        });

        if (result.success) {
          if (onSuccess) onSuccess();
          else navigate("/");
        } else {
          setError("Erro ao entrar com Google. Tente novamente.");
        }
      } catch (err) {
        console.error("Erro Google login:", err);
        setError("Erro ao processar login com Google.");
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: (err) => {
      console.error("Google OAuth error:", err);
      setError("Erro ao conectar com Google.");
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

        {/* Formulário */}
        <form className="flex flex-col gap-4" onSubmit={handleFormLogin}>
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />
          <input
            type="password"
            placeholder={t("login.pass")}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {loading ? "A entrar..." : t("login.log")}
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("login.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        {/* Botão Google customizado — sem iframe */}
        <button
          onClick={() => handleGoogleLogin()}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-lg py-2.5 px-4 hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
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