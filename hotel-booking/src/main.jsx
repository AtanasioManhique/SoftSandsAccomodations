import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import {GoogleOAuthProvider} from "@react-oauth/google"
import { CurrencyProvider } from "./FormDropDown/CurrencyContext";
import "./i18n";


// Import your Publishable Key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY
const Client_ID = "825997502039-e18bllidgaoedpmr24o107qpkd7t26ag.apps.googleusercontent.com"

if (!PUBLISHABLE_KEY) {
  throw new Error('Add your Clerk Publishable Key to the .env file')
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
       <GoogleOAuthProvider clientId={Client_ID}>
      
      <CurrencyProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
      </CurrencyProvider>
        </GoogleOAuthProvider>
  </StrictMode>
)

