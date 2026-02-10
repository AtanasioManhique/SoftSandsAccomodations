import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import { api } from "../services/api";
import logo from "../assets/palmtree.png";
import {useTranslation} from "react-i18next"

const RegisterPage = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ pegar função login do Context

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    city: "",
    acceptTerms: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("As palavras-passe não coincidem!");
      return;
    }

    setLoading(true);
    try {
      // ✅ envia para backend
      const res = await api.post("/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        city: formData.city,
      });

      // ✅ backend deve devolver token + user
      const { token, user } = res.data;

      // ✅ chama contexto Auth (salva localStorage e estado global)
      login(user, token);

      navigate("/"); // volta pra home logado
    } catch (err) {
      console.error(err);
      alert("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    try {
      const googleToken = response.credential;

      // ✅ opcionalmente enviar token Google para teu backend
      const res = await api.post("/auth/google", { token: googleToken });

      const { user, token } = res.data;
      login(user, token);

      navigate("/");
    } catch (err) {
      console.log("Erro Google:", err);
      alert("Erro ao entrar com Google.");
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 mt-15">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="SoftSands Logo" className="h-16 mx-auto mb-3" />

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("register.title")}</h2>
        <p className="text-gray-500 mb-6 text-sm">
        {t("register.subtitle")}
        </p>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder={t("register.fullname")}
            value={formData.name} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"/>

          <input type="email" name="email" placeholder="Email"
            value={formData.email} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"/>

          <input type="password" name="password" placeholder={t("register.password")}
            value={formData.password} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"/>

          <input type="password" name="confirmPassword" placeholder={t("register.confirm")}
            value={formData.confirmPassword} onChange={handleChange} required
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"/>

          <input type="text" name="city" placeholder={t("register.country")}
            value={formData.city} onChange={handleChange}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"/>

          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" name="acceptTerms"
              checked={formData.acceptTerms} onChange={handleChange} required />
            {t("register.terms")}
          </label>

          <button type="submit"
            className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all"
            disabled={loading}>
            {loading ? t("register.creating") : t("register.create")}
          </button>
        </form>

        <div className="flex items-center justify-center my-2">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("register.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error("Erro Google")} />

        <p className="mt-6 text-sm text-gray-600">
         {t("register.acc")}{" "}
          <a href="/login" className="text-blue-600 hover:underline">{t("login.log")}</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
