import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import {useTranslation} from "react-i18next"

const LoginPage = ({ isModal = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const {t}= useTranslation();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleFormLogin = (e) => {
    e.preventDefault();

    // ✅ Usuário fake enquanto não há backend
    const mockUser = {
      name: "Usuário Demo",
      email: formData.email,
      role: "user",
    };

    login(mockUser, "fake_token");
  };

  const handleGoogleSuccess = (response) => {
    try {
      const token = response.credential;
      const decoded = jwtDecode(token);

      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        role: "user",
      };

      login(userData, token);
      navigate("/");
    } catch (error) {
      console.error("Erro login Google:", error);
    }
  };

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
        <p className="text-gray-500 mb-6 text-sm">
          {t("login.continue")}
        </p>

        {/* Login Form */}
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
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
            required
          />

          <button className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all">
           {t("login.log")}
          </button>
        </form>

        <div className="flex items-center justify-center my-2">
          <div className="h-px bg-gray-300 w-1/3" />
          <span className="text-gray-400 text-sm mx-2">{t("login.or")}</span>
          <div className="h-px bg-gray-300 w-1/3" />
        </div>

        {/* Google Login */}
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => console.error("Erro Google Login")}
        />

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
