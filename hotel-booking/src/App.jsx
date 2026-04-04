
import Navbar from "./components/Navbar";
import React from "react";
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./FormDropDown/LoginForm";
import Footer from "./components/Footer";
import AllHouses from "./pages/AllHouses";
import HouseDetails from "./pages/HouseDetails";
import About from "./pages/About";
import RegisterPage from "./FormDropDown/RegisterForm";
import Settings from "./FormDropDown/Settings";
import { SettingsProvider } from "./FormDropDown/SettingsContext";
import { FavoriteProvider } from "./componentshouse/FavoriteStore";
import FavoritesPage from "./componentshouse/FavoritePage";
import PraiaPage from "./componentshouse/PraiaPage";
import MinhasReservas from "./FormDropDown/Bookings";
import ReservaDetalhes from "./FormDropDown/BookingsDetails";
import ReserveAgora from "./components/ReserveNow";
import TermosECondicoes from "./FormDropDown/Termsandconditions";
import PoliticaCancelamento from "./FormDropDown/PoliticaCancelamento";
import ContacteNos from "./FormDropDown/ContacteNos";
import PaymentConfirmation from "./Payments/paymentConfirmation";
import ProtectedAdminRoute from "./admin/protectedadminroute";
import AdminDashboard  from "./admin/admindashboard";
import AdminReservas   from "./admin/adminreservas";
import AdminCasas      from "./admin/admincasas";
import AdminPraias     from "./admin/adminpraias";
import AdminReviews    from "./admin/adminreviews";
import AdminCalendario from "./admin/admincalendario";
import AdminRelatorios from "./admin/adminrelatorios";
import ForgotPassword from "./FormDropDown/ForgotPassword";
import ResetPassword  from "./FormDropDown/ResetPassword";

function App() {
  const location = useLocation();
  const showFooterPaths = ["/", "/sobre", "/praias"];

  return (
    <SettingsProvider>
      <FavoriteProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />

          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<RegisterPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/praias/:praia" element={<PraiaPage />} />
              <Route path="/minhasreservas" element={<MinhasReservas />} />
              <Route path="/reservas/:id" element={<ReservaDetalhes />} />
              <Route path="/pagamento/:houseId" element={<ReserveAgora />} />
              <Route path="/termosecondições" element={<TermosECondicoes />} />
              <Route path="/politicacancelamento" element={<PoliticaCancelamento />} />
              <Route path="/contactenos" element={<ContacteNos />} />
              <Route path="/praias" element={<AllHouses />} />
              <Route path="/favoritos" element={<FavoritesPage />} />
              <Route path="/casas/:id" element={<HouseDetails />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/payment-confirmation" element={<PaymentConfirmation />} />
              <Route path="/forgot-password"  element={<ForgotPassword />} />
              <Route path="/reset-password"  element={<ResetPassword />} />
              <Route path="/admin/dashboard"  element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/reservas"   element={<ProtectedAdminRoute><AdminReservas /></ProtectedAdminRoute>} />
              <Route path="/admin/casas"      element={<ProtectedAdminRoute><AdminCasas /></ProtectedAdminRoute>} />
              <Route path="/admin/praias"     element={<ProtectedAdminRoute><AdminPraias /></ProtectedAdminRoute>} />
              <Route path="/admin/reviews"    element={<ProtectedAdminRoute><AdminReviews /></ProtectedAdminRoute>} />
              <Route path="/admin/calendario" element={<ProtectedAdminRoute><AdminCalendario /></ProtectedAdminRoute>} />
              <Route path="/admin/relatorios" element={<ProtectedAdminRoute><AdminRelatorios /></ProtectedAdminRoute>} />
            </Routes>
          </div>

          {showFooterPaths.includes(location.pathname) && <Footer />}
        </div>
      </FavoriteProvider>
    </SettingsProvider>
  );
}

export default App;