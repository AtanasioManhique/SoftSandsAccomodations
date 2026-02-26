import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from "@react-oauth/google"
import { CurrencyProvider } from "./FormDropDown/CurrencyContext";
import "./i18n";
import { LoginModalProvider } from "./context/LoginModalContext";
import LoginModal from "./context/LoginModal";
import { AuthProvider } from "./context/AuthContext";




// Import your Publishable Key

const Client_ID = "825997502039-e18bllidgaoedpmr24o107qpkd7t26ag.apps.googleusercontent.com"


createRoot(document.getElementById('root')).render(
  <StrictMode>
       <GoogleOAuthProvider clientId={Client_ID}>
      
      <CurrencyProvider>
      <BrowserRouter>
         <AuthProvider>
      <LoginModalProvider>
        <App />
        <LoginModal />
      </LoginModalProvider>
      </AuthProvider>
      </BrowserRouter>
      </CurrencyProvider>
        </GoogleOAuthProvider>
  </StrictMode>
)

