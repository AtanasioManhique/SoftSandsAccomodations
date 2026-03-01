// components/Navbar.jsx
// ─────────────────────────────────────────────────────────────
// Corrigido: usa useAuth() em vez de ler localStorage diretamente.
// Isso garante que a Navbar reage automaticamente ao login/logout
// sem precisar de eventos customizados ou window.dispatchEvent.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import menuIcon from "../assets/menu-bar.png";
import ssearch from "../assets/white-search.png";
import close from "../assets/close.png";
import loginuser from "../assets/loginuser.png";
import { useTranslation } from "react-i18next";
import { Heart, UserPlus, Settings, LogOut, Calendar } from "lucide-react";
import { useLoginModal } from "../context/LoginModalContext";

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const { openLogin } = useLoginModal();
  const navigate = useNavigate();
  const location = useLocation();

  const navLinks = [
    { key: "home", path: "/" },
    { key: "explore", path: "/praias" },
    { key: "about", path: "/sobre" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownDesktopRef = useRef(null);
  const dropdownMobileRef = useRef(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    setIsScrolled(window.scrollY > 10 || !isHome);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const desktopOutside = dropdownDesktopRef.current && !dropdownDesktopRef.current.contains(e.target);
      const mobileOutside = dropdownMobileRef.current && !dropdownMobileRef.current.contains(e.target);
      if (desktopOutside && mobileOutside) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate("/");
  };

  const renderUserIcon = () => {
    if (!user) return null;
    return user.picture ? (
      <img src={user.picture} alt="profile"
        className="w-8 h-8 rounded-full object-cover border transition-all duration-500 ease-in-out" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
        {user?.name?.[0]?.toUpperCase()}
      </div>
    );
  };

  const scrolled = isScrolled || !isHome;

  // ── Itens do dropdown ─────────────────────────────────────
  const DropdownLogged = () => (
    <>
      <DropdownBtn icon={<Heart size={18} />} label={t("navbar.fav")} to="/favoritos" />
      <DropdownBtn icon={<Calendar size={18} />} label={t("navbar.reserves")} to="/minhasreservas" />
      <DropdownBtn icon={<Settings size={18} />} label={t("navbar.settings")} to="/settings" />
      <hr />
      <DropdownBtn icon={<img src="/icons/terms-and-conditions.png" className="w-5 h-5" />} label={t("navbar.terms")} to="/termosecondições" />
      <DropdownBtn icon={<img src="/icons/cancel.png" className="w-5 h-5" />} label={t("navbar.cancellation")} to="/politicacancelamento" />
      <hr />
      <button onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2">
        <LogOut size={18} /> {t("navbar.exit")}
      </button>
    </>
  );

  const DropdownGuest = () => (
    <>
      <DropdownBtn icon={<img src="/icons/user (1).png" className="w-5 h-5" />} label={t("navbar.session")} to="/login" />
      <DropdownBtn icon={<UserPlus size={18} />} label={t("navbar.sign")} to="/signup" />
      <DropdownBtn icon={<img src="/icons/world.png" className="w-5 h-5" />} label={t("configurations.languagecurrency")} to="/settings" />
    </>
  );

  // No mobile, "Iniciar Sessão" abre o LoginModal em vez de navegar
  // para /login. Isto garante que o Google Login funciona corretamente
  // sem ser bloqueado por overflow-hidden ou posicionamento absoluto.
  const DropdownGuestMobile = () => (
    <>
      <button
        onClick={() => { setIsDropdownOpen(false); openLogin(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
      >
        <img src="/icons/user (1).png" className="w-5 h-5" /> {t("navbar.session")}
      </button>
      <DropdownBtn icon={<UserPlus size={18} />} label={t("navbar.sign")} to="/signup" />
      <DropdownBtn icon={<img src="/icons/world.png" className="w-5 h-5" />} label={t("configurations.languagecurrency")} to="/settings" />
    </>
  );

  const DropdownBtn = ({ icon, label, to }) => (
    <button onClick={() => { navigate(to); setIsDropdownOpen(false); }}
      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
      {icon} {label}
    </button>
  );

  return (
    <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 z-50
      transition-all duration-500 ease-in-out
      ${scrolled ? "bg-white shadow-md text-gray-700 py-3 md:py-4 animate-fade-in" : "bg-transparent py-4 md:py-6"}`}>

      {/* Logo */}
      <Link to="/" className="flex items-center gap-2 text-xl font-semibold transition-all duration-500 ease-in-out">
        <img src={logo} alt="logo" className="h-9 brightness-200 transition-all duration-500 ease-in-out" />
        <span className={`transition-all duration-500 ease-in-out ${scrolled ? "text-black" : "text-white"}`}>
          SoftSands
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link) => (
          <Link key={link.key} to={link.path}
            className={`group flex flex-col gap-0.5 transition-all duration-500 ease-in-out ${scrolled ? "text-gray-700" : "text-white"}`}>
            {t(`navbar.${link.key}`)}
            <div className={`${scrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-in-out`} />
          </Link>
        ))}
      </div>

      {/* Right Section Desktop */}
      <div className="hidden md:flex items-center gap-4 relative" ref={dropdownDesktopRef}>
        <img src={ssearch} alt="Search"
          className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert" : ""}`} />

        {user && renderUserIcon()}

        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:shadow-md transition-all duration-500 ease-in-out">
          <img src={menuIcon} alt="Menu"
            className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`} />
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-55 bg-white rounded-xl shadow-xl border border-gray-100 animate-fadeIn overflow-hidden">
            {user ? <DropdownLogged /> : <DropdownGuest />}
          </div>
        )}
      </div>

      {/* Mobile Header */}
      <div className="flex md:hidden items-center gap-3 relative" ref={dropdownMobileRef}>
        <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 overflow-hidden">
          {user ? (
            user.picture ? (
              <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                {user?.name?.[0]?.toUpperCase()}
              </div>
            )
          ) : (
            <img src={loginuser} alt="Menu" className="h-7" />
          )}
        </button>

        {isDropdownOpen && (
          <div className="absolute top-14 right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 animate-slideDown overflow-hidden">
            {user ? <DropdownLogged /> : <DropdownGuestMobile />}
          </div>
        )}

        <img src={ssearch} alt="Pesquisar" className="h-7 cursor-pointer invert transition-all duration-500 ease-in-out" />
        <img onClick={() => setIsMenuOpen(!isMenuOpen)} src={menuIcon}
          className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`} />
      </div>

      {/* Menu Lateral Mobile */}
      <div className={`fixed top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden items-center justify-center gap-6 text-gray-800 transition-all duration-500 ease-in-out ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
          <img src={close} alt="Close Menu" className="h-6 w-6" />
        </button>
        {navLinks.map((link, i) => (
          <Link key={i} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-lg transition-all duration-500 ease-in-out">
            {t(`navbar.${link.key}`)}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;