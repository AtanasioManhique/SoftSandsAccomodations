// FormDropDown/RegisterForm.jsx
import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import { useTranslation } from "react-i18next";

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register, loginWithGoogle, loading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    acceptTerms: false,
  });

  const [error, setError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // ── Validações client-side ────────────────────────────

    // 1. Email deve conter @
    if (!formData.email.includes("@")) {
      setError("Por favor introduza um email válido.");
      return;
    }

    // 2. Password mínimo 8 caracteres
    if (formData.password.length < 8) {
      setError("A palavra-passe deve ter no mínimo 8 caracteres.");
      return;
    }

    // 3. Passwords devem coincidir
    if (formData.password !== formData.confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    // 4. Termos aceites
    if (!formData.acceptTerms) {
      setError(t("register.termsRequired") || "Você precisa aceitar os termos.");
      return;
    }

    // ─────────────────────────────────────────────────────

    const result = await register({
      name:            formData.name.trim(),
      email:           formData.email.trim(),
      password:        formData.password,
      confirmPassword: formData.confirmPassword,
      country:         (formData.city || "").trim(),
    });

    if (result?.success) navigate("/");
    else setError(String(result?.error || "Erro ao criar conta. Tente novamente."));
  };

  // ── Google via popup ──────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    flow: "implicit",

    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      setError(null);
      try {
        const googleAccessToken = tokenResponse?.access_token;
        if (!googleAccessToken) throw new Error("Google não retornou access_token.");

        const result = await loginWithGoogle(googleAccessToken);

        if (result?.success) navigate("/");
        else setError(String(result?.error || "Erro ao entrar com Google."));
      } catch (err) {
        console.error("Erro Google:", err);
        setError(err?.message || "Erro ao processar Google.");
      } finally {
        setGoogleLoading(false);
      }
    },

    onError: () => setError("Erro ao conectar com Google."),
  });

  const isLoading = loading || googleLoading;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 mt-15">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="SoftSands Logo" className="h-16 mx-auto mb-3" />

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("register.title")}</h2>
        <p className="text-gray-500 mb-6 text-sm">{t("register.subtitle")}</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder={t("register.fullname")}
            value={formData.name} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />

          <input type="email" name="email" placeholder="Email"
            value={formData.email} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />

          <input type="password" name="password" placeholder={t("register.password")}
            value={formData.password} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />

          <input type="password" name="confirmPassword" placeholder={t("register.confirm")}
            value={formData.confirmPassword} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />

          <input type="text" name="city" placeholder={t("register.country")}
            value={formData.city} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none" />

          <label className="flex items-center gap-2 text-sm text-gray-600 text-left">
            <input type="checkbox" name="acceptTerms"
              checked={formData.acceptTerms} onChange={handleChange} required />
            <span>
              {t("register.terms")}{" "}
              <a href="/termosecondições" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-medium">
                {t("navbar.terms")}
              </a>
            </span>
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button type="submit" disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50">
            {isLoading ? t("register.creating") : t("register.create")}
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("register.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

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
          {t("register.acc")}{" "}
          <a href="/login" className="text-blue-600 hover:underline">{t("login.log")}</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;