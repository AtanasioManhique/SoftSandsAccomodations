import Navbar from './components/Navbar'
import React from 'react'
import './App.css'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import LoginPage from './FormDropDown/LoginForm'
import Footer from './components/Footer'
import AllHouses from './pages/AllHouses'
import HouseDetails from './pages/HouseDetails'
import About from './pages/About'
import RegisterPage from "./FormDropDown/RegisterForm"
import { AuthProvider } from "./context/AuthContext";
import Settings from "./FormDropDown/Settings"
import { SettingsProvider } from "./FormDropDown/SettingsContext";
import { FavoriteProvider } from "./componentshouse/FavoriteStore";
import FavoritesPage from "./componentshouse/FavoritePage";
import PraiaPage from "./componentshouse/PraiaPage"
import MinhasReservas from "./FormDropDown/Bookings"
import ReservaDetalhes from "./FormDropDown/BookingsDetails"
import ReserveAgora from "./components/ReserveNow"
import TermosECondicoes from "./FormDropDown/Termsandconditions"
import PoliticaCancelamento from "./FormDropDown/PoliticaCancelamento"
import ContacteNos from "./FormDropDown/ContacteNos"
import PaymentConfirmation from "./Payments/paymentConfirmation"

function App() {

  const location = useLocation();

  // Rotas onde o footer deve aparecer
  const showFooterPaths = ["/", "/sobre", "/praias"];

  return (
    <SettingsProvider>
      <AuthProvider>
  
        <FavoriteProvider>

          <div className="flex flex-col min-h-screen">
            <Navbar />

            <div className='flex-1'>
              <Routes>
                <Route path='/' element={<Home />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<RegisterPage />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/praias/:praia" element={<PraiaPage />} />
                <Route path="/minhasreservas" element={<MinhasReservas />}/>
                <Route path="/reservas/:id" element={<ReservaDetalhes />}  />
                <Route path="/pagamento/:houseId" element={<ReserveAgora />} />
                <Route path="/termosecondições" element={<TermosECondicoes />} />
                <Route path="politicacancelamento" element={<PoliticaCancelamento />}   />
                <Route path="contactenos" element={<ContacteNos />}/>
                <Route path="/praias" element={<AllHouses />} />
                <Route path="/favoritos" element={<FavoritesPage />} />
                <Route path='/casas/:id' element={<HouseDetails />} />
                <Route path='/sobre' element={<About />} />
                <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              </Routes>
            </div>

            {showFooterPaths.includes(location.pathname) && <Footer />}
          </div>
        </FavoriteProvider>
      </AuthProvider>
    </SettingsProvider>
  );
}

export default App;
