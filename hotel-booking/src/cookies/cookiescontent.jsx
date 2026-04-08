

import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

// ─── textos por idioma ───────────────────────────────────────────────────────

const texts = {
  pt: {
    title: "Usamos cookies",
    description:
      "Utilizamos cookies para melhorar a sua experiência e analisar o tráfego. Pode gerir as suas preferências abaixo.",
    manage: "Gerir preferências",
    hide_details: "Ocultar detalhes",
    save_prefs: "Guardar escolha",
    reject: "Recusar",
    accept_all: "Aceitar todos",
    essential_title: "Essenciais",
    essential_desc:
      "Necessários para o funcionamento do site (sessão, segurança). Não podem ser desactivados.",
    analytics_title: "Análise",
    analytics_desc:
      "Ajudam-nos a perceber como os visitantes utilizam o site (páginas visitadas, tempo de sessão).",
  },
  en: {
    title: "We use cookies",
    description:
      "We use cookies to improve your experience and analyse traffic. You can manage your preferences below.",
    manage: "Manage preferences",
    hide_details: "Hide details",
    save_prefs: "Save choice",
    reject: "Reject all",
    accept_all: "Accept all",
    essential_title: "Essential",
    essential_desc:
      "Required for the site to work (session, security). Cannot be disabled.",
    analytics_title: "Analytics",
    analytics_desc:
      "Help us understand how visitors use the site (pages visited, session duration).",
  },
};

// Detecta o idioma do browser — PT se português, EN para tudo o resto
function detectLang() {
  const lang = navigator.language || navigator.userLanguage || "en";
  return lang.toLowerCase().startsWith("pt") ? "pt" : "en";
}

// ─── helpers ────────────────────────────────────────────────────────────────

const STORAGE_KEY = "cookie_consent";

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveLocally(prefs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
}

async function sendToBackend(prefs) {
  try {
    await fetch(`${BASE_URL}/api/cookies/consent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(prefs),
    });
  } catch (err) {
    console.warn("Cookie consent backend call failed:", err);
  }
}

// ─── component ──────────────────────────────────────────────────────────────

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [prefs, setPrefs] = useState({ analytics: false });

  // Detecta idioma uma vez, no momento em que o componente é montado
  const T = texts[detectLang()];

  useEffect(() => {
    const saved = loadSaved();
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  // ── handlers ──────────────────────────────────────────────────────────────

  function handleAcceptAll() {
    const consent = {
      essential: true,
      analytics: true,
      accepted_at: new Date().toISOString(),
    };
    saveLocally(consent);
    sendToBackend(consent);
    setVisible(false);
  }

  function handleRejectAll() {
    const consent = {
      essential: true,
      analytics: false,
      accepted_at: new Date().toISOString(),
    };
    saveLocally(consent);
    sendToBackend(consent);
    setVisible(false);
  }

  function handleSavePrefs() {
    const consent = {
      essential: true,
      analytics: prefs.analytics,
      accepted_at: new Date().toISOString(),
    };
    saveLocally(consent);
    sendToBackend(consent);
    setVisible(false);
  }

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlay subtil */}
      <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 pointer-events-none" />

      {/* Banner */}
      <div
        className="
          fixed bottom-4 left-1/2 -translate-x-1/2
          w-[calc(100%-2rem)] max-w-2xl
          bg-white rounded-2xl shadow-2xl border border-gray-100
          z-50 animate-slide-up
        "
        role="dialog"
        aria-modal="true"
        aria-label={T.title}
      >
        {/* Barra de cor no topo */}
        <div className="h-1 rounded-t-2xl bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400" />

        <div className="p-5 sm:p-6">
          {/* Cabeçalho */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-2xl select-none">🍪</span>
            <div>
              <h2 className="font-semibold text-gray-900 text-base leading-tight">
                {T.title}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{T.description}</p>
            </div>
          </div>

          {/* Painel de detalhes (expandível) */}
          {showDetails && (
            <div className="mt-4 mb-4 space-y-3 border-t pt-4">
              {/* Essenciais — sempre activos */}
              <CookieRow
                title={T.essential_title}
                description={T.essential_desc}
                checked={true}
                disabled={true}
              />

              {/* Analytics */}
              <CookieRow
                title={T.analytics_title}
                description={T.analytics_desc}
                checked={prefs.analytics}
                onChange={(v) => setPrefs((p) => ({ ...p, analytics: v }))}
              />
            </div>
          )}

          {/* Botões */}
          <div className="flex flex-col sm:flex-row gap-2 mt-4">
            <button
              onClick={() => setShowDetails((s) => !s)}
              className="
                text-sm text-gray-500 underline underline-offset-2
                hover:text-gray-800 transition-colors
                sm:mr-auto self-center
              "
            >
              {showDetails ? T.hide_details : T.manage}
            </button>

            {showDetails && (
              <button
                onClick={handleSavePrefs}
                className="
                  px-4 py-2 rounded-xl text-sm font-medium
                  border border-blue-500 text-blue-600
                  hover:bg-blue-50 transition-colors
                "
              >
                {T.save_prefs}
              </button>
            )}

            <button
              onClick={handleRejectAll}
              className="
                px-4 py-2 rounded-xl text-sm font-medium
                border border-gray-200 text-gray-600
                hover:bg-gray-50 transition-colors
              "
            >
              {T.reject}
            </button>

            <button
              onClick={handleAcceptAll}
              className="
                px-5 py-2 rounded-xl text-sm font-semibold
                bg-blue-600 text-white
                hover:bg-blue-700 active:scale-95 transition-all
              "
            >
              {T.accept_all}
            </button>
          </div>
        </div>
      </div>

      {/* Animação slide-up */}
      <style>{`
        @keyframes slide-up {
          from { opacity: 0; transform: translateX(-50%) translateY(24px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        .animate-slide-up {
          animation: slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
    </>
  );
}

// ─── sub-componente: linha de toggle ────────────────────────────────────────

function CookieRow({ title, description, checked, disabled = false, onChange }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-800">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{description}</p>
      </div>

      {/* Toggle */}
      <button
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange?.(!checked)}
        className={`
          relative flex-shrink-0 w-10 h-6 rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-1
          ${checked ? "bg-blue-500" : "bg-gray-200"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        `}
      >
        <span
          className={`
            absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow
            transition-transform duration-200
            ${checked ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}