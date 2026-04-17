// FormDropDown/ForgotPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import logo from "../assets/palmtree.png";
import {useTranslation} from "react-i18next"
export default function ForgotPassword() {
  const [email, setEmail]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState(null);
  const {t} = useTranslation();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Introduza o seu email.");
      return;
    }

    setLoading(true);
    try {
      // BACKEND: POST /api/auth/forgot-password
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status && status >= 500) {
        setError("Erro no servidor. Tente novamente mais tarde.");
      } else {
        // Simula sucesso mesmo que email não exista (segurança)
        setSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Ecrã de confirmação após envio ───────────────────────
  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          {/* Ícone envelope */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800">{t("verification.title")}</h2>

          <p className="text-gray-500 text-sm leading-relaxed">
          {t("recover.title")}{" "}
            <span className="font-semibold text-gray-700">{email}</span>,
            {t("recover.link")}
          </p>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700 text-left space-y-1">
            <p className="font-semibold">📬{t("recover.receive")}</p>
            <p>{t("recover.spam")}</p>
          </div>

          <button
            onClick={() => { setSent(false); setEmail(""); }}
            className="w-full py-2.5 border-2 border-gray-200 hover:border-blue-400 text-gray-700 hover:text-blue-600 rounded-xl font-semibold text-sm transition"
          >
            {t("receive.try")}
          </button>

          <Link
            to="/login"
            className="block text-sm text-blue-600 hover:underline font-medium"
          >
            ← {t("verification.login")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulário de email ───────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="SoftSands" className="h-16 mx-auto mb-3" />

        <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("recover.pass")}</h2>
        <p className="text-gray-500 text-sm mb-6">
          {t("recover.email")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(null); }}
              placeholder=""
              required
              className={`border rounded-lg px-4 py-2.5 focus:ring-2 outline-none transition-colors text-sm ${
                error
                  ? "border-red-400 focus:ring-red-300 bg-red-50"
                  : "border-gray-300 focus:ring-blue-400"
              }`}
            />
            {error && <p className="text-red-500 text-xs px-1">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                {t("recover.sending")}
              </>
            ) : (
              {t("recover.send")}
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="block mt-5 text-sm text-blue-600 hover:underline font-medium"
        >
          ← {t("verification.login")}
        </Link>
      </div>
    </div>
  );
}