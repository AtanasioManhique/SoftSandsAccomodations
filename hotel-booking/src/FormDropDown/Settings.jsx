// Settings.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PersonalData from "./PersonalData";
import LanguageCurrency from "./LanguageCurrency";

// Payments.jsx e PaymentMethods.jsx foram removidos —
// o PaySuite gere todos os métodos de pagamento (Visa, M-Pesa, e-Mola)
// diretamente na página de checkout deles.

export default function Settings() {
  const { user }    = useAuth();
  const { t }       = useTranslation();
  const [selected, setSelected]         = useState(user ? "personal" : "language");
  const [mobileScreen, setMobileScreen] = useState("menu");

  const menuItems = [
    ...(user
      ? [{ id: "personal", label: t("configurations.personaldata"), icon: "/icons/user.png" }]
      : []),
    { id: "language", label: t("configurations.languagecurrency"), icon: "/icons/world.png" },
  ];

  const renderContent = () => {
    switch (selected) {
      case "personal": return <PersonalData />;
      case "language":  return <LanguageCurrency />;
      default:          return null;
    }
  };

  const renderMobileContent = () => {
    switch (mobileScreen) {
      case "personal":
        return (
          <div className="p-4">
            <button className="text-blue-600 mb-4" onClick={() => setMobileScreen("menu")}>
              ← {t("bookingdetails.back")}
            </button>
            <PersonalData />
          </div>
        );
      case "language":
        return (
          <div className="p-4">
            <button className="text-blue-600 mb-4" onClick={() => setMobileScreen("menu")}>
              ← {t("bookingdetails.back")}
            </button>
            <LanguageCurrency />
          </div>
        );
      default: return null;
    }
  };

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex p-6 gap-8 max-w-6xl mx-auto min-h-screen mt-20">
        <aside className="w-64 border-r">
          <h2 className="text-2xl font-bold mb-6">{t("settings.acc")}</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id} onClick={() => setSelected(item.id)}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition ${
                  selected === item.id ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"
                }`}
              >
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
                {item.label}
              </li>
            ))}
          </ul>
          {!user && (
            <div className="mt-6 text-sm">
              <p className="mb-2">{t("settings.access")}:</p>
              <Link to="/login" className="text-blue-600 font-medium underline hover:text-blue-800">
                {t("settings.session")}
              </Link>
            </div>
          )}
        </aside>
        <main className="flex-1 p-4">{renderContent()}</main>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-4 mt-16">
        {mobileScreen === "menu" && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t("settings.acc")}</h2>
            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li key={item.id} onClick={() => setMobileScreen(item.id)}
                  className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.icon} className="w-6 h-6" alt="" />
                    <span className="text-lg">{item.label}</span>
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </li>
              ))}
            </ul>
            {!user && (
              <div className="mt-6 text-sm">
                <p className="mb-2">{t("settings.access")}:</p>
                <Link to="/login" className="text-blue-600 font-medium underline hover:text-blue-800">
                  {t("settings.session")}
                </Link>
              </div>
            )}
          </>
        )}
        {mobileScreen !== "menu" && renderMobileContent()}
      </div>
    </>
  );
}