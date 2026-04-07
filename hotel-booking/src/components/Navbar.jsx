// components/Navbar.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import menuIcon from "../assets/menu-bar.png";
import ssearch from "../assets/white-search.png";
import close from "../assets/close.png";
import loginuser from "../assets/loginuser.png";
import { useTranslation } from "react-i18next";
import { Heart, UserPlus, Settings, LogOut, Calendar, X, Shield, Home, Waves } from "lucide-react";
import { useLoginModal } from "../context/LoginModalContext";
import { api } from "../services/api";

// ── Debounce helper ───────────────────────────────────────────
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
// ─────────────────────────────────────────────────────────────

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

// ── Componente SearchOverlay ──────────────────────────────────
const SearchOverlay = ({ onClose }) => {
  const navigate    = useNavigate();
  const { t }       = useTranslation();
  const inputRef    = useRef(null);

  const [query,   setQuery]   = useState("");
  const [results, setResults] = useState({ praias: [], casas: [] });
  const [loading, setLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 50); }, []);

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, [onClose]);

  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults({ praias: [], casas: [] }); return; }
    search(debouncedQuery.trim());
  }, [debouncedQuery]);

  const search = async (q) => {
    setLoading(true);
    try {
      // GET /api/search?q=query
      // Resposta esperada:
      // { praias: [{ name, total }], casas: [{ id, location, bedroom, capacity, price, image }] }
      const res  = await api.get("/accommodations", { params: { search: q, limit: 20 } });
      const casas = res.data?.data ?? [];

      // agrupar por location para gerar as praias

      const praiasMap = {};
      casas.forEach((c) => {
        if (!c.location) return;
        praiasMap[c.location] = (praiasMap[c.location] ?? 0) +1;
      });

      const praias = Object.entries(praiasMap).map(([name, total]) => ({ name, total }));

      setResults({ praias, casas });
    } catch {
      setResults({ praias: [], casas: [] });
    } finally {
      setLoading(false);
    }
  };

  const goToPraia = (name) => {
    onClose();
    navigate(`/praias?search=${encodeURIComponent(name)}`);
  };

  const goToCasa = (id) => {
    onClose();
    navigate(`/casas/${id}`);
  };

  const goToAll = () => {
    onClose();
    navigate(`/praias?search=${encodeURIComponent(query.trim())}`);
  };

  const hasResults = results.praias.length > 0 || results.casas.length > 0;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-[80]"
        onClick={onClose}
        style={{ animation: "fadeIn 0.15s ease" }}
      />

      {/* Painel de pesquisa */}
      <div
        className="fixed top-0 left-0 right-0 z-[90] bg-white shadow-2xl"
        style={{ animation: "slideDown 0.2s cubic-bezier(0.4,0,0.2,1)" }}
      >
        <style>{`
          @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
          @keyframes slideDown { from{transform:translateY(-8px);opacity:0} to{transform:translateY(0);opacity:1} }
        `}</style>

        {/* Input */}
        <div className="flex items-center gap-3 px-4 md:px-8 py-3 border-b border-gray-100">
          <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("navbar.search") || "Pesquisar praias, casas..."}
            className="flex-1 outline-none text-gray-900 text-base bg-transparent placeholder-gray-400"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
          {query && !loading && (
            <button onClick={() => setQuery("")} className="text-gray-400 hover:text-gray-700 transition shrink-0">
              <X size={16} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition shrink-0 font-medium text-sm ml-2"
          >
            Cancelar
          </button>
        </div>

        {/* Resultados */}
        {query.trim() && (
          <div className="max-h-[70vh] overflow-y-auto px-4 md:px-8 py-3 space-y-1">

            {!hasResults && !loading && (
              <p className="text-gray-400 text-sm py-6 text-center">
                {t("navbar.noresults")} "<strong className="text-gray-600">{query}</strong>"
              </p>
            )}

            {/* Praias */}
            {results.praias.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2">Praias</p>
                {results.praias.map((praia) => (
                  <button
                    key={praia.name}
                    onClick={() => goToPraia(praia.name)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                      <Waves size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{praia.name}</p>
                      <p className="text-xs text-gray-400">{praia.total} casa{praia.total !== 1 ? "s" : ""} disponível{praia.total !== 1 ? "is" : ""}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Casas */}
            {results.casas.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-2 mt-1">Casas</p>
                {results.casas.map((casa) => {
                  const imageUrl = casa.images?.casa_images?.[0]?.url || casa.image?.[0];
                  const price = casa.price_per_night ?? casa.PricePerNight;
                  const bedrooms = casa.bedroom ?? casa.Bedroom;
                  const guests = casa.max_guests ?? casa.maxGuests;

                  return (
                    <button
                      key={casa.id}
                      onClick={() => goToCasa(casa.id)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-gray-50 transition text-left"
                    >
                    <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={casa.name} className="w-full h-full object-cover" />
                        ) : (
                          <Home size={16} className="text-green-600" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{casa.location}</p>
                      <p className="text-xs text-gray-400">
                        {casa.location} · {bedrooms} quarto{bedrooms !== 1 ? "s" : ""} · {guests} hósp.
                      </p>
                    </div>
                    {price && (
                      <p className="text-sm font-semibold text-gray-700 shrink-0">
                       R {Number(price).toLocaleString("en-ZA")}/noite
                      </p>
                    )}
                  </button>
                );
              })}
              </div>
            )}

            {/* Ver todos */}
            {hasResults && (
              <button
                onClick={goToAll}
                className="w-full text-center text-sm text-blue-600 font-medium py-3 hover:underline border-t border-gray-100 mt-1"
              >
                {t("navbar.results")} "{query}" →
              </button>
            )}
          </div>
        )}
      </div>
    </>,
    document.body
  );
};
// ─────────────────────────────────────────────────────────────

const Navbar = () => {
  const { t } = useTranslation();
  const { user, logout, isAdmin } = useAuth();
  const { openLogin } = useLoginModal();
  const navigate  = useNavigate();
  const location  = useLocation();

  const navLinks = [
    { key: "home",    path: "/"       },
    { key: "explore", path: "/praias" },
    { key: "about",   path: "/sobre"  },
  ];

  const [isScrolled,     setIsScrolled]     = useState(false);
  const [isMenuOpen,     setIsMenuOpen]     = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isSearchOpen,   setIsSearchOpen]   = useState(false);

  const dropdownDesktopRef = useRef(null);
  const dropdownMobileRef  = useRef(null);
  const isHome = location.pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    setIsScrolled(window.scrollY > 10 || !isHome);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHome]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const desktopOut = dropdownDesktopRef.current && !dropdownDesktopRef.current.contains(e.target);
      const mobileOut  = dropdownMobileRef.current  && !dropdownMobileRef.current.contains(e.target);
      if (desktopOut && mobileOut) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  const handleLogout = () => { logout(); setIsDropdownOpen(false); navigate("/"); };
  const closeDropdown = () => setIsDropdownOpen(false);
  const scrolled = isScrolled || !isHome;

  const renderUserIcon = () => {
    if (!user) return null;
    return user.picture ? (
      <img src={user.picture} alt="profile" className="w-8 h-8 rounded-full object-cover border" />
    ) : (
      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
        {user.name?.[0]?.toUpperCase()}
      </div>
    );
  };

  const DropdownLogged = () => (
    <div className="py-1">
      <DropdownBtn icon={<Heart size={16} />}    label={t("navbar.fav")}      to="/favoritos"      onClose={closeDropdown} />
      <DropdownBtn icon={<Calendar size={16} />} label={t("navbar.reserves")} to="/minhasreservas" onClose={closeDropdown} />
      <DropdownBtn icon={<Settings size={16} />} label={t("navbar.settings")} to="/settings"       onClose={closeDropdown} />
      <hr className="my-1 border-gray-100" />
      <DropdownBtn icon={<img src="/icons/terms-and-conditions.png" className="w-4 h-4" alt="" />} label={t("navbar.terms")} to="/termosecondições" onClose={closeDropdown} />
      <DropdownBtn icon={<img src="/icons/cancel.png" className="w-4 h-4" alt="" />} label={t("navbar.cancellation")} to="/politicacancelamento" onClose={closeDropdown} />
      <hr className="my-1 border-gray-100" />
      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2 text-sm">
        <LogOut size={16} /> {t("navbar.exit")}
      </button>
    </div>
  );

  const DropdownGuest = () => (
    <div className="py-1">
      <DropdownBtn icon={<img src="/icons/user (1).png" className="w-4 h-4" alt="" />} label={t("navbar.session")} to="/login" onClose={closeDropdown} />
      <DropdownBtn icon={<UserPlus size={16} />} label={t("navbar.sign")} to="/signup" onClose={closeDropdown} />
      <DropdownBtn icon={<img src="/icons/world.png" className="w-4 h-4" alt="" />} label={t("configurations.languagecurrency")} to="/settings" onClose={closeDropdown} />
    </div>
  );

  const DropdownGuestMobile = () => (
    <div className="py-1">
      <button onClick={() => { closeDropdown(); openLogin(); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-sm text-gray-700">
        <img src="/icons/user (1).png" className="w-4 h-4" alt="" /> {t("navbar.session")}
      </button>
      <DropdownBtn icon={<UserPlus size={16} />} label={t("navbar.sign")} to="/signup" onClose={closeDropdown} />
      <DropdownBtn icon={<img src="/icons/world.png" className="w-4 h-4" alt="" />} label={t("configurations.languagecurrency")} to="/settings" onClose={closeDropdown} />
    </div>
  );

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 z-50 transition-all duration-500 ease-in-out ${scrolled ? "bg-white shadow-md text-gray-700 py-3 md:py-4" : "bg-transparent py-4 md:py-6"}`}>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-xl font-semibold transition-all duration-500 ease-in-out">
          <img src={logo} alt="logo" className="h-9 brightness-200 transition-all duration-500 ease-in-out" />
          <span className={`transition-all duration-500 ease-in-out ${scrolled ? "text-black" : "text-white"}`}>SoftSands</span>
        </Link>

        {/* Desktop: links + Admin */}
        <div className="hidden md:flex items-center gap-4 lg:gap-8">
          {navLinks.map((link) => (
            <Link key={link.key} to={link.path} className={`group flex flex-col gap-0.5 transition-all duration-500 ease-in-out ${scrolled ? "text-gray-700" : "text-white"}`}>
              {t(`navbar.${link.key}`)}
              <div className={`${scrolled ? "bg-gray-700" : "bg-white"} h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-in-out`} />
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin/dashboard" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 shadow-sm">
              <Shield size={14} /> Admin
            </Link>
          )}
        </div>

        {/* Desktop: search + user */}
        <div className="hidden md:flex items-center gap-4 relative" ref={dropdownDesktopRef}>
          <button onClick={() => setIsSearchOpen(true)} className="flex items-center justify-center" aria-label="Pesquisar">
            <img src={ssearch} alt="Search" className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert" : ""}`} />
          </button>

          {user && renderUserIcon()}

          <button onClick={() => setIsDropdownOpen((prev) => !prev)} className="flex items-center justify-center w-10 h-10 rounded-full hover:shadow-md transition-all duration-500 ease-in-out" aria-label="Menu">
            <img src={menuIcon} alt="" className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-12 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {user ? <DropdownLogged /> : <DropdownGuest />}
            </div>
          )}
        </div>

        {/* Mobile: user + search + hamburger */}
        <div className="flex md:hidden items-center gap-3 relative" ref={dropdownMobileRef}>
          <button onClick={() => setIsDropdownOpen((prev) => !prev)} className="flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 overflow-hidden" aria-label="Menu do utilizador">
            {user ? (
              user.picture
                ? <img src={user.picture} alt="profile" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-gray-800 text-white flex items-center justify-center font-bold text-sm">{user.name?.[0]?.toUpperCase()}</div>
            ) : (
              <img src={loginuser} alt="Utilizador" className="h-6" />
            )}
          </button>

          {isDropdownOpen && (
            <div className="absolute top-12 right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
              {user ? <DropdownLogged /> : <DropdownGuestMobile />}
            </div>
          )}

          <button onClick={() => setIsSearchOpen(true)} aria-label="Pesquisar">
            <img src={ssearch} alt="Pesquisar" className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert" : ""}`} />
          </button>

          <button onClick={() => setIsMenuOpen(true)} aria-label="Abrir menu">
            <img src={menuIcon} alt="Menu" className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${scrolled ? "invert-0" : "invert"}`} />
          </button>
        </div>

        {/* Menu lateral mobile */}
        <div className={`fixed top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden items-center justify-center gap-6 text-gray-800 transition-all duration-500 ease-in-out z-[70] ${isMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <button className="absolute top-4 right-4" onClick={() => setIsMenuOpen(false)}>
            <img src={close} alt="Fechar" className="h-6 w-6" />
          </button>
          {navLinks.map((link) => (
            <Link key={link.key} to={link.path} onClick={() => setIsMenuOpen(false)} className="text-lg">{t(`navbar.${link.key}`)}</Link>
          ))}
          {isAdmin && (
            <Link to="/admin/dashboard" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-base font-semibold transition-all duration-200 shadow-sm">
              <Shield size={16} /> Painel Admin
            </Link>
          )}
        </div>
      </nav>

      {isSearchOpen && <SearchOverlay onClose={() => setIsSearchOpen(false)} />}
    </>
  );
};

export default Navbar;