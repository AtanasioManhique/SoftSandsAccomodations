// components/Navbar.jsx
// ─────────────────────────────────────────────────────────────
// Corrigido: usa useAuth() em vez de ler localStorage diretamente.
// Search com overlay escuro no mobile via Portal.
// Dropdown hamburger e user funcionando corretamente.
// Scroll do body bloqueado quando menu lateral está aberto.
// Animação de entrada na barra de pesquisa mobile.
// ─────────────────────────────────────────────────────────────

import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import menuIcon from "../assets/menu-bar.png";
import ssearch from "../assets/white-search.png";
import close from "../assets/close.png";
import loginuser from "../assets/loginuser.png";
import { useTranslation } from "react-i18next";
import { Heart, UserPlus, Settings, LogOut, Calendar, X } from "lucide-react";
import { useLoginModal } from "../context/LoginModalContext";

// ── DropdownBtn fora dos sub-componentes para evitar re-renders ──
const DropdownBtn = ({ icon, label, to, onClose }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    if (onClose) onClose();
    if (to) navigate(to);
  };
  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
    >
      {icon} {label}
    </button>
  );
};

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

  // ── Search state ──────────────────────────────────────────
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const dropdownDesktopRef = useRef(null);
  const dropdownMobileRef = useRef(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    setIsScrolled(window.scrollY > 10 || !isHome);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e) => {
      const desktopOutside =
        dropdownDesktopRef.current && !dropdownDesktopRef.current.contains(e.target);
      const mobileOutside =
        dropdownMobileRef.current && !dropdownMobileRef.current.contains(e.target);
      if (desktopOutside && mobileOutside) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Foca o input desktop quando a barra de pesquisa abre
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Fecha pesquisa com Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") handleSearchClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleLogout = () => {
    logout();

    // ── BACKEND: POST /api/auth/logout ─────────────────────
    // Descomentar quando o backend estiver pronto:
    // await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    // ───────────────────────────────────────────────────────

    setIsDropdownOpen(false);
    navigate("/");
  };

  // ── Lógica de pesquisa ────────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // ── BACKEND: GET /api/search?q=searchQuery ─────────────
    // Descomentar quando o backend estiver pronto:
    // navigate(`/pesquisa?q=${encodeURIComponent(searchQuery.trim())}`);
    // ───────────────────────────────────────────────────────

    // Temporário — substituir pela linha acima com backend:
    navigate(`/praias?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setIsSearchOpen(false);
  };

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const renderUserIcon = () => {
    if (!user) return null;
    return user.picture ? (
      <img
        src={user.picture}
        alt="profile"
        className="w-8 h-8 rounded-full object-cover border transition-all duration-500 ease-in-out"
      />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
        {user.name?.[0]?.toUpperCase()}
      </div>
    );
  };

  const closeDropdown = () => setIsDropdownOpen(false);
  const scrolled = isScrolled || !isHome;

  // ── Itens do dropdown ─────────────────────────────────────
  const DropdownLogged = () => (
    <div className="py-1">
      <DropdownBtn icon={<Heart size={16} />} label={t("navbar.fav")} to="/favoritos" onClose={closeDropdown} />
      <DropdownBtn icon={<Calendar size={16} />} label={t("navbar.reserves")} to="/minhasreservas" onClose={closeDropdown} />
      <DropdownBtn icon={<Settings size={16} />} label={t("navbar.settings")} to="/settings" onClose={closeDropdown} />
      <hr className="my-1 border-gray-100" />
      <DropdownBtn
        icon={<img src="/icons/terms-and-conditions.png" className="w-4 h-4" alt="" />}
        label={t("navbar.terms")}
        to="/termosecondições"
        onClose={closeDropdown}
      />
      <DropdownBtn
        icon={<img src="/icons/cancel.png" className="w-4 h-4" alt="" />}
        label={t("navbar.cancellation")}
        to="/politicacancelamento"
        onClose={closeDropdown}
      />
      <hr className="my-1 border-gray-100" />
      <button
        onClick={handleLogout}
        className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2 text-sm"
      >
        <LogOut size={16} /> {t("navbar.exit")}
      </button>
    </div>
  );

  const DropdownGuest = () => (
    <div className="py-1">
      <DropdownBtn
        icon={<img src="/icons/user (1).png" className="w-4 h-4" alt="" />}
        label={t("navbar.session")}
        to="/login"
        onClose={closeDropdown}
      />
      <DropdownBtn icon={<UserPlus size={16} />} label={t("navbar.sign")} to="/signup" onClose={closeDropdown} />
      <DropdownBtn
        icon={<img src="/icons/world.png" className="w-4 h-4" alt="" />}
        label={t("configurations.languagecurrency")}
        to="/settings"
        onClose={closeDropdown}
      />
    </div>
  );

  // No mobile, "Iniciar Sessão" abre o LoginModal em vez de navegar
  // para /login. Isto garante que o Google Login funciona corretamente
  // sem ser bloqueado por overflow-hidden ou posicionamento absoluto.
  const DropdownGuestMobile = () => (
    <div className="py-1">
      <button
        onClick={() => { closeDropdown(); openLogin(); }}
        className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700"
      >
        <img src="/icons/user (1).png" className="w-4 h-4" alt="" />
        {t("navbar.session")}
      </button>
      <DropdownBtn icon={<UserPlus size={16} />} label={t("navbar.sign")} to="/signup" onClose={closeDropdown} />
      <DropdownBtn
        icon={<img src="/icons/world.png" className="w-4 h-4" alt="" />}
        label={t("configurations.languagecurrency")}
        to="/settings"
        onClose={closeDropdown}
      />
    </div>
  );

  // ── Portal de pesquisa mobile ─────────────────────────────
  // IMPORTANTE: chamado como função {mobileSearchPortal()} e NÃO como
  // componente <MobileSearchPortal /> — assim o React não destrói e
  // recria o input a cada render, permitindo escrever normalmente.
  const mobileSearchPortal = () =>
    createPortal(
      <>
        {/* Overlay escuro animado */}
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden animate-[fadeIn_0.2s_ease]"
          onClick={handleSearchClose}
          style={{ animation: "fadeIn 0.2s ease" }}
        />
        {/* Barra de pesquisa com animação de entrada (slide down) */}
        <div
          className="fixed top-0 left-0 w-full z-50 md:hidden bg-white shadow-lg px-4 py-3 flex items-center gap-3"
          style={{ animation: "slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)" }}
        >
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes slideDown {
              from { transform: translateY(-100%); opacity: 0; }
              to   { transform: translateY(0);     opacity: 1; }
            }
          `}</style>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full border border-gray-200 rounded-full px-4 py-2 bg-gray-50"
          >
            <img src={ssearch} alt="" className="h-4 invert opacity-40 shrink-0" />
            <input
              ref={mobileSearchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("navbar.search")}
              className="outline-none text-sm text-gray-700 flex-1 bg-transparent"
              autoFocus
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")} aria-label="Limpar">
                <X size={14} className="text-gray-400" />
              </button>
            )}
          </form>
          <button
            type="button"
            onClick={handleSearchClose}
            className="text-gray-500 hover:text-gray-800 transition shrink-0 font-medium text-sm"
          >
            {t("navbar.cancel")}
          </button>
        </div>
      </>,
      document.body
    );

  return (
    <>
      <nav
        className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 z-50
          transition-all duration-500 ease-in-out
          ${scrolled ? "bg-white shadow-md text-gray-700 py-3 md:py-4" : "bg-transparent py-4 md:py-6"}`}
      >
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
            <Link
              key={link.key}
              to={link.path}
              className={`group flex flex-col gap-0.5 transition-all duration-500 ease-in-out ${
                scrolled ? "text-gray-700" : "text-white"
              }`}
            >
              {t(`navbar.${link.key}`)}
              <div className={`${scrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-in-out`} />
            </Link>
          ))}
        </div>

        {/* Right Section Desktop */}
        <div className="hidden md:flex items-center gap-4 relative" ref={dropdownDesktopRef}>
          {isSearchOpen ? (
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-full px-3 py-1.5 shadow-sm transition-all duration-300"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("navbar.search")}
                className="outline-none text-sm text-gray-700 w-48 bg-transparent"
              />
              <button type="submit" aria-label="Pesquisar">
                <img src={ssearch} alt="" className="h-4 invert opacity-60 hover:opacity-100 transition" />
              </button>
              <button type="button" onClick={handleSearchClose} aria-label="Fechar pesquisa">
                <X size={16} className="text-gray-400 hover:text-gray-700 transition" />
              </button>
            </form>
          ) : (
            <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center" aria-label="Abrir pesquisa">
              <img
                src={ssearch}
                alt="Search"
                className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert" : ""}`}
              />
            </button>
          )}

          {user && renderUserIcon()}

          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:shadow-md transition-all duration-500 ease-in-out"
            aria-label="Menu"
          >
            <img
              src={menuIcon}
              alt=""
              className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {user ? <DropdownLogged /> : <DropdownGuest />}
            </div>
          )}
        </div>

        {/* ── Mobile Header ── */}
        <div className="flex md:hidden items-center gap-3 relative" ref={dropdownMobileRef}>
          {/* Botão user / dropdown */}
          <button
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 overflow-hidden"
            aria-label="Menu do utilizador"
          >
            {user ? (
              user.picture ? (
                <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.name?.[0]?.toUpperCase()}
                </div>
              )
            ) : (
              <img src={loginuser} alt="Utilizador" className="h-6" />
            )}
          </button>

          {/* Dropdown mobile */}
          {isDropdownOpen && (
            <div className="absolute top-12 right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
              {user ? <DropdownLogged /> : <DropdownGuestMobile />}
            </div>
          )}

          {/* Botão de pesquisa mobile */}
          <button onClick={() => setIsSearchOpen(true)} aria-label="Pesquisar">
            <img
              src={ssearch}
              alt="Pesquisar"
              className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert" : ""}`}
            />
          </button>

          {/* Botão hamburger */}
          <button onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu">
            <img
              src={menuIcon}
              alt="Menu"
              className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`}
            />
          </button>
        </div>

        {/* Menu Lateral Mobile */}
        <div
          className={`fixed top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden items-center justify-center gap-6 text-gray-800 transition-all duration-500 ease-in-out z-[70] ${
            isMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)} aria-label="Fechar menu">
            <img src={close} alt="Fechar" className="h-6 w-6" />
          </button>
          {navLinks.map((link) => (
            <Link
              key={link.key}
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg transition-all duration-500 ease-in-out"
            >
              {t(`navbar.${link.key}`)}
            </Link>
          ))}
        </div>
      </nav>

      {/* Portal da pesquisa mobile — chamado como função para preservar o input */}
      {isSearchOpen && mobileSearchPortal()}
    </>
  );
};

export default Navbar;