import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
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
    city: "", // UI chama city, backend quer country
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

    if (!formData.acceptTerms) {
      setError(t("register.termsRequired") || "Você precisa aceitar os termos.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword, // ✅ backend exige
      country: (formData.city || "").trim(),     // ✅ backend exige (mapeado)
    });

    if (result?.success) navigate("/");
    else setError(String(result?.error || "Erro ao criar conta. Tente novamente."));
  };

  const isLoading = loading || googleLoading;

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 mt-15">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="SoftSands Logo" className="h-16 mx-auto mb-3" />

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("register.title")}</h2>
        <p className="text-gray-500 mb-6 text-sm">{t("register.subtitle")}</p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder={t("register.fullname")}
            value={formData.name}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="password"
            name="password"
            placeholder={t("register.password")}
            value={formData.password}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder={t("register.confirm")}
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <input
            type="text"
            name="city"
            placeholder={t("register.country")}
            value={formData.city}
            onChange={handleChange}
            required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
          />

          <label className="flex items-center gap-2 text-sm text-gray-600 text-left">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
            />
            {t("register.terms")}
          </label>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50"
          >
            {isLoading ? t("register.creating") : t("register.create")}
          </button>
        </form>

        <div className="flex items-center justify-center my-4">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("register.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        {/* Google: backend quer idToken (credential) */}
        <div className="flex justify-center">
          <div className={isLoading ? "pointer-events-none opacity-60" : ""}>
            <GoogleLogin
              onSuccess={async (cred) => {
                setGoogleLoading(true);
                setError(null);
                try {
                  const idToken = cred?.credential;
                  if (!idToken) throw new Error("Google não retornou idToken.");

                  const result = await loginWithGoogle(idToken);
                  if (result?.success) navigate("/");
                  else setError(String(result?.error || "Erro ao entrar com Google."));
                } catch (err) {
                  console.error("Erro Google:", err);
                  setError(err?.message || "Erro ao processar Google.");
                } finally {
                  setGoogleLoading(false);
                }
              }}
              onError={() => setError("Erro ao conectar com Google.")}
            />
          </div>
        </div>

        <p className="mt-6 text-sm text-gray-600">
          {t("register.acc")}{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            {t("login.log")}
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;