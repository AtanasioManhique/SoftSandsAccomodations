// FormDropDown/ResetPassword.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { api } from "../services/api";
import logo from "../assets/palmtree.png";
import {useTranslation} from "react-i18next"

// ── Indicador de força da password ───────────────────────────
const getStrength = (password) => {
  if (!password) return { level: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8)              score++;
  if (/[A-Z]/.test(password))            score++;
  if (/[0-9]/.test(password))            score++;
  if (/[^A-Za-z0-9]/.test(password))     score++;

  if (score <= 1) return { level: 1, label: "Fraca",  color: "bg-red-400"    };
  if (score === 2) return { level: 2, label: "Média",  color: "bg-yellow-400" };
  if (score === 3) return { level: 3, label: "Boa",    color: "bg-blue-400"   };
  return            { level: 4, label: "Forte", color: "bg-green-500"  };
};

const StrengthBar = ({ password }) => {
  const { level, label, color } = getStrength(password);
  if (!password) return null;

  return (
    <div className="mt-1 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
              i <= level ? color : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p className={`text-xs px-1 font-medium ${
        level === 1 ? "text-red-500" :
        level === 2 ? "text-yellow-500" :
        level === 3 ? "text-blue-500" : "text-green-600"
      }`}>
        Força: {label}
      </p>
    </div>
  );
};


export default function ResetPassword() {
  const [searchParams]          = useSearchParams();
  const navigate                = useNavigate();
  const token                   = searchParams.get("token");
  const {t} = useTranslation();
  const [password, setPassword]           = useState("");
  const [confirm, setConfirm]             = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [errors, setErrors]               = useState({});
  const [generalError, setGeneralError]   = useState(null);
  const [tokenInvalid, setTokenInvalid]   = useState(false);


  // Verifica se o token existe na URL
  useEffect(() => {
    if (!token) setTokenInvalid(true);
  }, [token]);

  const validate = () => {
    const errs = {};
    if (!password)              errs.password = t("reset.new");
    else if (password.length < 8) errs.password = t("reset.caractere");
    if (!confirm)               errs.confirm  = t("reset.confirm");
    else if (password !== confirm) errs.confirm = t("reset.reconfirm");
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setErrors({});

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        token,
        password,
        confirmPassword: confirm,
      });
      setSuccess(true);
    } catch (err) {
      const status  = err?.response?.status;
      const message = err?.response?.data?.message ?? err?.response?.data?.error?.message;

      if (status === 400 || status === 404) {
        // Token inválido ou expirado
        setTokenInvalid(true);
      } else {
        setGeneralError(message || "Erro ao redefinir a palavra-passe. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Token inválido ou expirado ────────────────────────────
  if (tokenInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t("resetpass.title")}</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            {t("reset.subtitle")}
          </p>
          <Link
            to="/recuperar-senha"
            className="block w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition text-center"
          >
           {t("resetpass.link")}
          </Link>
          <Link to="/login" className="block text-sm text-blue-600 hover:underline">
            ← {t("verification.login")}
          </Link>
        </div>
      </div>
    );
  }

  // ── Sucesso ───────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{t("resetpass.new")}</h2>
          <p className="text-gray-500 text-sm">
        {t("resetpass.redefined")}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition"
          >
            {t("verification.login")}
          </button>
        </div>
      </div>
    );
  }

  // ── Formulário nova password ──────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 pt-24">
      <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
        <img src={logo} alt="SoftSands" className="h-16 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("resetpass.pass")}</h2>
        <p className="text-gray-500 text-sm mb-6">
         {t("resetpass.newpass")}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>

          {/* Nova password */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
              {t("resetpass.pass")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: null })); }}
                placeholder="Mínimo 8 caracteres"
                className={`w-full border rounded-lg px-4 py-2.5 pr-11 focus:ring-2 outline-none transition-colors text-sm ${
                  errors.password
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : "border-gray-300 focus:ring-blue-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <StrengthBar password={password} />
            {errors.password && (
              <p className="text-red-500 text-xs px-1">{errors.password}</p>
            )}
          </div>

          {/* Confirmar password */}
          <div className="flex flex-col gap-1 text-left">
            <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide px-1">
             {t("resetpass.confirm")}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirm}
                onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: null })); }}
                placeholder="Repita a nova palavra-passe"
                className={`w-full border rounded-lg px-4 py-2.5 pr-11 focus:ring-2 outline-none transition-colors text-sm ${
                  errors.confirm
                    ? "border-red-400 focus:ring-red-300 bg-red-50"
                    : confirm && confirm === password
                      ? "border-green-400 focus:ring-green-300"
                      : "border-gray-300 focus:ring-blue-400"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
              >
                {showConfirm ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {/* Tick de confirmação */}
            {confirm && confirm === password && !errors.confirm && (
              <p className="text-green-600 text-xs px-1 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                {t("resetpass.password")}
              </p>
            )}
            {errors.confirm && (
              <p className="text-red-500 text-xs px-1">{errors.confirm}</p>
            )}
          </div>

          {generalError && (
            <p className="text-red-500 text-sm text-center">{generalError}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-1"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
               {t("resetpass.keep")}
              </>
            ) : (
              t("resetpass.password")
            )}
          </button>
        </form>

        <Link to="/login" className="block mt-5 text-sm text-blue-600 hover:underline">
          ← {t("verification.login")}
        </Link>
      </div>
    </div>
  );
}