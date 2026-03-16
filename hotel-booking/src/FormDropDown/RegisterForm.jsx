// FormDropDown/RegisterForm.jsx
import React, { useState, useMemo } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import { useTranslation } from "react-i18next";
import EmailVerificationModal from "./EmailVerificationModal";
import Select from "react-select";
import countries from "world-countries";

// ── Lista de países com bandeira emoji ───────────────────────
const countryOptions = countries
  .map((c) => ({
    value: c.name.common,
    label: c.name.common,
    flag: c.flag,
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const selectStyles = {
  control: (base, state) => ({
    ...base,
    borderRadius: "0.5rem",
    borderColor: state.selectProps.hasError
      ? "#f87171"
      : state.isFocused
      ? "#60a5fa"
      : "#d1d5db",
    backgroundColor: state.selectProps.hasError ? "#fef2f2" : "white",
    boxShadow: state.isFocused
      ? state.selectProps.hasError
        ? "0 0 0 2px #fca5a5"
        : "0 0 0 2px #93c5fd"
      : "none",
    "&:hover": { borderColor: state.selectProps.hasError ? "#f87171" : "#60a5fa" },
    padding: "1px 4px",
    fontSize: "0.875rem",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected ? "#2563eb" : state.isFocused ? "#eff6ff" : "white",
    color: state.isSelected ? "white" : "#374151",
    fontSize: "0.875rem",
  }),
  placeholder: (base) => ({ ...base, color: "#9ca3af", fontSize: "0.875rem" }),
  singleValue: (base) => ({ ...base, color: "#374151", fontSize: "0.875rem" }),
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
};

const formatOptionLabel = ({ flag, label }) => (
  <div className="flex items-center gap-2">
    <span className="text-lg leading-none">{flag}</span>
    <span>{label}</span>
  </div>
);

// ─────────────────────────────────────────────────────────────

const parseBackendError = (errorString) => {
  if (!errorString || typeof errorString !== "string") {
    return { field: null, message: "Erro ao criar conta. Tente novamente." };
  }
  const codeMatch = errorString.match(/^\[([A-Z0-9_]+)\]\s*(.*)/);
  const code = codeMatch?.[1] ?? null;
  const humanMessage = codeMatch?.[2] ?? errorString;
  const codeMap = {
    EMAIL_EXISTS: "email",
    NAME_EXISTS: "name",
  };
  const field = code ? codeMap[code] ?? null : null;
  const translations = {
    "An account with this email already exists": "Este email já está registado.",
    "An account with this name already exists": "Este nome de utilizador já está em uso.",
  };
  const message = translations[humanMessage] ?? humanMessage;
  return { field, message };
};

const validateClient = (formData, t) => {
  const errors = {};
  if (!formData.name.trim()) errors.name = "O nome completo é obrigatório.";
  if (!formData.email.trim()) errors.email = "O email é obrigatório.";
  else if (!formData.email.includes("@")) errors.email = "Por favor introduza um email válido.";
  if (!formData.password) errors.password = "A palavra-passe é obrigatória.";
  else if (formData.password.length < 8)
    errors.password = "A palavra-passe deve ter no mínimo 8 caracteres.";
  if (!formData.confirmPassword)
    errors.confirmPassword = "Por favor confirme a sua palavra-passe.";
  else if (formData.password !== formData.confirmPassword)
    errors.confirmPassword = "As palavras-passe não coincidem.";
  if (!formData.city) errors.city = "O país é obrigatório.";
  if (!formData.acceptTerms)
    errors.acceptTerms = t("register.termsRequired") || "Deve aceitar os termos.";
  return errors;
};

// ── Fora do RegisterPage para evitar perda de foco ───────────
const InputField = ({
  type = "text",
  name,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
}) => (
  <div className="flex flex-col gap-1 text-left">
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`border rounded-lg px-4 py-2 focus:ring-2 outline-none transition-colors ${
        error
          ? "border-red-400 focus:ring-red-300 bg-red-50"
          : "border-gray-300 focus:ring-blue-400"
      }`}
    />
    {error && <p className="text-red-500 text-xs px-1">{error}</p>}
  </div>
);

// ─────────────────────────────────────────────────────────────

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

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n[name];
        return n;
      });
    }
    if (generalError) setGeneralError(null);
  };

  const handleCountryChange = (selected) => {
    setFormData((prev) => ({ ...prev, city: selected ? selected.value : "" }));
    if (fieldErrors.city) {
      setFieldErrors((prev) => {
        const n = { ...prev };
        delete n.city;
        return n;
      });
    }
  };

  const handleEmailBlur = () => {
    if (formData.email && !formData.email.includes("@")) {
      setFieldErrors((prev) => ({ ...prev, email: "Por favor introduza um email válido." }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    const clientErrors = validateClient(formData, t);
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      return;
    }
    setFieldErrors({});

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      country: formData.city,
    });

    if (result?.success) {
      setShowVerificationModal(true);
    } else {
      const { field, message } = parseBackendError(result?.error);
      if (field) setFieldErrors({ [field]: message });
      else setGeneralError(message);
    }
  };

  // ── Google Login corrigido ────────────────────────────────
  const handleGoogleSuccess = async (credentialResponse) => {
    setGoogleLoading(true);
    setGeneralError(null);

    try {
      const idToken = credentialResponse?.credential;

      if (!idToken) {
        throw new Error("Google não retornou credential.");
      }

      const result = await loginWithGoogle(idToken);

      if (result?.success) {
        navigate("/");
      } else {
        const { message } = parseBackendError(result?.error);
        setGeneralError(message);
      }
    } catch (err) {
      console.error("Erro Google:", err);
      setGeneralError(err?.message || "Erro ao processar Google.");
    } finally {
      setGoogleLoading(false);
    }
  };

  const isLoading = loading || googleLoading;

  const selectedCountry = useMemo(
    () => countryOptions.find((o) => o.value === formData.city) ?? null,
    [formData.city]
  );

  return (
    <>
      {showVerificationModal && (
        <EmailVerificationModal
          email={formData.email}
          onClose={() => setShowVerificationModal(false)}
        />
      )}

      <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-blue-50 to-blue-100 p-4 mt-15">
        <div className="bg-white shadow-lg rounded-2xl p-8 w-full max-w-md text-center">
          <img src={logo} alt="SoftSands Logo" className="h-16 mx-auto mb-3" />
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{t("register.title")}</h2>
          <p className="text-gray-500 mb-6 text-sm">{t("register.subtitle")}</p>

          <form className="flex flex-col gap-3" onSubmit={handleSubmit} noValidate>
            <InputField
              name="name"
              placeholder={t("register.fullname")}
              value={formData.name}
              onChange={handleChange}
              error={fieldErrors.name}
            />
            <InputField
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleEmailBlur}
              error={fieldErrors.email}
            />
            <InputField
              type="password"
              name="password"
              placeholder={t("register.password")}
              value={formData.password}
              onChange={handleChange}
              error={fieldErrors.password}
            />
            <InputField
              type="password"
              name="confirmPassword"
              placeholder={t("register.confirm")}
              value={formData.confirmPassword}
              onChange={handleChange}
              error={fieldErrors.confirmPassword}
            />

            <div className="flex flex-col gap-1 text-left">
              <Select
                options={countryOptions}
                value={selectedCountry}
                onChange={handleCountryChange}
                formatOptionLabel={formatOptionLabel}
                placeholder={t("register.country") || "Seleccione o seu país"}
                styles={selectStyles}
                hasError={!!fieldErrors.city}
                menuPortalTarget={document.body}
                menuPosition="fixed"
                noOptionsMessage={() => "Nenhum país encontrado"}
                isClearable
              />
              {fieldErrors.city && (
                <p className="text-red-500 text-xs px-1">{fieldErrors.city}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 text-left">
              <label className="flex items-center gap-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  name="acceptTerms"
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                />
                <span>
                  {t("register.terms")}{" "}
                  <a
                    href="/termosecondições"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {t("navbar.terms")}
                  </a>
                </span>
              </label>
              {fieldErrors.acceptTerms && (
                <p className="text-red-500 text-xs px-1">{fieldErrors.acceptTerms}</p>
              )}
            </div>

            {generalError && (
              <p className="text-red-500 text-sm text-center">{generalError}</p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 mt-1"
            >
              {isLoading ? t("register.creating") : t("register.create")}
            </button>
          </form>

          <div className="flex items-center justify-center my-4">
            <div className="h-px bg-gray-300 w-1/3" />
            <span className="text-gray-400 text-sm mx-2">{t("register.or")}</span>
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
                onError={() => setGeneralError("Erro ao conectar com Google.")}
              />
            )}
          </div>

          <p className="mt-6 text-sm text-gray-600">
            {t("register.acc")}{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              {t("login.log")}
            </a>
          </p>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;