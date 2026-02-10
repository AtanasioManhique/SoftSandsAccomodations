import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {useTranslation} from "react-i18next"
import PersonalData from "./PersonalData";
import Payments from "./Payments";
import LanguageCurrency from "./LanguageCurrency";
export default function Settings() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(user ? "personal" : "language");
  const {t} = useTranslation();
  const [mobileScreen, setMobileScreen] = useState("menu");
  // menu | personal | payments | language

  const menuItems = [
    ...(user
      ? [
          { id: "personal", label: t("configurations.personaldata"), icon: "/icons/user.png" },
          { id: "payments", label: t("configurations.payments"), icon: "/icons/credit-card.png" },
        ]
      : []),
    { id: "language", label: t("configurations.languagecurrency"), icon: "/icons/world.png" }
  ];

  const renderContent = () => {
    switch (selected) {
      case "personal":
        return <PersonalData />;
      case "payments":
        return <Payments />;
      case "language":
        return <LanguageCurrency />;
      default:
        return null;
    }
  };

  const renderMobileContent = () => {
    switch (mobileScreen) {
      case "personal":
        return (
          <div className="p-4">
            <button className="text-blue-600 -mb-1" onClick={() => setMobileScreen("menu")}>
              ← {t("bookingdetails.back")}
            </button>
            <PersonalData />
          </div>
        );
      case "payments":
        return (
          <div className="p-4">
            <button className="text-blue-600 mb-6" onClick={() => setMobileScreen("menu")}>
              ← {t("bookingdetails.back")}
            </button>
            <Payments />
          </div>
        );
      case "language":
        return (
          <div className="p-4">
            <button className="text-blue-600 -mb-1" onClick={() => setMobileScreen("menu")}>
              ← {t("bookingdetails.back")}
            </button>
            <LanguageCurrency />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* --------------- DESKTOP VIEW --------------- */}
      <div className="hidden md:flex p-6 gap-8 max-w-6xl mx-auto min-h-screen mt-20">
        {/* MENU LATERAL */}
        <aside className="w-64 border-r">
          <h2 className="text-2xl font-bold mb-6">{t("settings.acc")}</h2>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li
                key={item.id}
                onClick={() => setSelected(item.id)}
                className={`flex items-center gap-2 p-3 rounded-lg cursor-pointer transition 
                  ${selected === item.id ? "bg-gray-200 font-semibold" : "hover:bg-gray-100"}
                `}
              >
                <img src={item.icon} alt={item.label} className="w-5 h-5" />
                {item.label}
              </li>
            ))}
          </ul>

          {!user && (
            <div className="mt-6 text-sm">
              <p className="mb-2">{t("settings.access")}:</p>
              <Link
                to="/login"
                className="text-blue-600 font-medium underline hover:text-blue-800"
              >
                {t("settings.session")}
              </Link>
            </div>
          )}
        </aside>

        {/* CONTEÚDO */}
        <main className="flex-1 p-4">{renderContent()}</main>
      </div>

      {/* --------------- MOBILE VIEW --------------- */}
      <div className="md:hidden p-4 mt-16">
        {mobileScreen === "menu" && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t("settings.acc")}</h2>

            <ul className="space-y-4">
              {menuItems.map((item) => (
                <li
                  key={item.id}
                  onClick={() => setMobileScreen(item.id)}
                  className="flex items-center justify-between p-3 border rounded-xl bg-white shadow-sm active:scale-[0.98] transition"
                >
                  <div className="flex items-center gap-3">
                    <img src={item.icon} className="w-6 h-6" />
                    <span className="text-lg">{item.label}</span>
                  </div>
                  <span className="text-gray-400 text-xl">›</span>
                </li>
              ))}
            </ul>

            {!user && (
              <div className="mt-6 text-sm">
                <p className="mb-2">{t("settings.access")}:</p>
                <Link
                  to="/login"
                  className="text-blue-600 font-medium underline hover:text-blue-800"
                >
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
