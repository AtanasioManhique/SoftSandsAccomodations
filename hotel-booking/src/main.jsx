// main.jsx
// ─────────────────────────────────────────────────────────────
// IMPORTANTE: AuthProvider deve estar DENTRO do BrowserRouter
// para que o useNavigate funcione nos componentes filhos.
// GoogleOAuthProvider deve ser o mais externo possível.
// ─────────────────────────────────────────────────────────────

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { CurrencyProvider } from "./FormDropDown/CurrencyContext";
import "./i18n";
import { LoginModalProvider } from "./context/LoginModalContext";
import LoginModal from "./context/LoginModal";
import { AuthProvider } from "./context/AuthContext";

// ─────────────────────────────────────────────────────────────
// BACKEND: Mover o Client ID para variável de ambiente.
// Substituir por: const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
// E criar ficheiro .env com: VITE_GOOGLE_CLIENT_ID=825997502039-...
// ─────────────────────────────────────────────────────────────
const CLIENT_ID = "825997502039-e18bllidgaoedpmr24o107qpkd7t26ag.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={CLIENT_ID}>
      <CurrencyProvider>
        <BrowserRouter>
          <AuthProvider>                  {/* ✅ dentro do BrowserRouter */}
            <LoginModalProvider>
              <App />
              <LoginModal />
            </LoginModalProvider>
          </AuthProvider>
        </BrowserRouter>
      </CurrencyProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);