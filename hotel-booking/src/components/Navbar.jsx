import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/palmtree.png";
import menuIcon from "../assets/menu-bar.png";
import ssearch from "../assets/white-search.png";
import close from "../assets/close.png";
import loginuser from "../assets/loginuser.png";
import {useTranslation} from "react-i18next"

// 🧩 Importação dos ícones
import {
  User,
  Heart,
  LogIn,
  UserPlus,
  Settings,
  LogOut,
  HelpCircle,
  Calendar,
} from "lucide-react";

const Navbar = () => {

  const {t} = useTranslation()
  const navLinks = [
    { key: "home", path: "/" },
    { key: "explore", path: "/praias" },
    { key: "about", path: "/sobre" },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const navigate = useNavigate();
  const location = useLocation();
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
    const onUserLoggedIn = () => {
      const updatedUser = localStorage.getItem("user");
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };
    window.addEventListener("user_logged_in", onUserLoggedIn);
    const onStorage = (e) => {
      if (e.key === "user") onUserLoggedIn();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("user_logged_in", onUserLoggedIn);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      const desktopOutside =
        dropdownDesktopRef.current &&
        !dropdownDesktopRef.current.contains(e.target);
      const mobileOutside =
        dropdownMobileRef.current &&
        !dropdownMobileRef.current.contains(e.target);
      if (desktopOutside && mobileOutside) setIsDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    window.dispatchEvent(new Event("user_logged_in"));
    setIsDropdownOpen(false);
    navigate("/");
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
      <div className="w-8 h-8 rounded-full bg-gray-800 text-white flex items-center justify-center font-bold">
        {user?.name?.[0]?.toUpperCase()}
      </div>
    );
  };

  return (
    <nav
      className={`fixed top-0 left-0 w-full flex items-center justify-between px-4 md:px-16 lg:px-24 xl:px-32 z-50
      transition-all duration-500 ease-in-out
      ${
        isScrolled || !isHome
          ? "bg-white shadow-md text-gray-700 py-3 md:py-4 animate-fade-in"
          : "bg-transparent py-4 md:py-6"
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className="flex items-center gap-2 text-xl font-semibold transition-all duration-500 ease-in-out"
      >
        <img
          src={logo}
          alt="logo"
          className={`h-9 transition-all duration-500 ease-in-out ${
            isScrolled || !isHome ? "brightness-200" : "brightness-200"
          }`}
        />
        <span
          className={`transition-all duration-500 ease-in-out ${
            isScrolled || !isHome ? "text-black" : "text-white"
          }`}
        >
          SoftSands
        </span>
      </Link>

      {/* Desktop Links */}
      <div className="hidden md:flex items-center gap-4 lg:gap-8">
        {navLinks.map((link, i) => (
          <Link
            key={link.key}
            to={link.path}
            className={`group flex flex-col gap-0.5 transition-all duration-500 ease-in-out ${
              isScrolled || !isHome ? "text-gray-700" : "text-white"
            }`}
          >
            {t(`navbar.${link.key}`)}
            <div
              className={`${
                isScrolled || !isHome ? "bg-gray-700" : "bg-white"
              } h-0.5 w-0 group-hover:w-full transition-all duration-300 ease-in-out`}
            />
          </Link>
        ))}
      </div>

      {/* Right Section Desktop */}
      <div
        className="hidden md:flex items-center gap-4 relative"
        ref={dropdownDesktopRef}
      >
        <img
          src={ssearch}
          alt="Search"
          className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${
            isScrolled || !isHome ? "invert" : ""
          }`}
        />

        {user && renderUserIcon()}

        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:shadow-md transition-all duration-500 ease-in-out"
        >
          <img
            src={menuIcon}
            alt="Menu"
            className={`h-6 cursor-pointer transition-all duration-500 ease-in-out ${
              isScrolled || !isHome ? "invert-0" : "invert"
            }`}
          />
        </button>

        {/* Dropdown Desktop */}
        {isDropdownOpen && (
          <div className="absolute right-0 top-12 w-55 bg-white rounded-xl shadow-xl border border-gray-100 animate-fadeIn transition-all duration-300 ease-in-out overflow-hidden">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/favoritos");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Heart size={18} /> {t('navbar.fav')}
                </button>
                <button
                  onClick={() => {
                    navigate("/minhasreservas");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Calendar size={18} /> {t("navbar.reserves")}
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={18} /> {t("navbar.settings")}
                </button>
                < hr/>
                <button
                  onClick={() => {
                    navigate("/termosecondições");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/terms-and-conditions.png" className="w-5 h-5"/> {t("navbar.terms")}
                </button>
                <button
                  onClick={() => {
                    navigate("/politicacancelamento");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/cancel.png" className="w-5 h-5"/> {t("navbar.cancellation")}
                </button>
                <hr />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={18} /> {t("navbar.exit")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/user (1).png" className="w-5 h-5"/> {t("navbar.session")}
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <UserPlus size={18} /> {t("navbar.sign")}
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/world.png" className="w-5 h-5"/> {t("configurations.languagecurrency")}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* 🔹 Mobile Header */}
      <div
        className="flex md:hidden items-center gap-3 transition-all duration-500 ease-in-out relative"
        ref={dropdownMobileRef}
      >
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-gray-300"
        >
          <img src={loginuser} alt="Menu" className="h-7" />
        </button>

        {/* Dropdown Mobile */}
        {isDropdownOpen && (
          <div className="absolute top-14 right-0 w-52 bg-white rounded-xl shadow-xl border border-gray-100 animate-slideDown transition-all duration-300 ease-in-out overflow-hidden">
            {user ? (
              <>
                <button
                  onClick={() => {
                    navigate("/favoritos");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Heart size={18} /> {t("navbar.fav")}
                </button>
                <button
                  onClick={() => {
                    navigate("/minhasreservas");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Calendar size={18} /> {t("navbar.reserves")}
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={18}/> {t("navbar.settings")}
                </button>
                <hr />
                <button
                  onClick={() => {
                    navigate("/termosecondições");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/terms-and-conditions.png" className="w-5 h-5"/> {t("navbar.terms")}
                </button>
                <button
                  onClick={() => {
                    navigate("/politicacancelamento");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/cancel.png" className="w-5 h-5"/> {t("navbar.cancellation")}
                </button>
                
                <hr />
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100 flex items-center gap-2"
                >
                  <LogOut size={18} /> {t("navbar.exit")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <img src="/icons/user (1).png" className= "w-5 h-5"/> {t("navbar.session")}
                </button>
                <button
                  onClick={() => {
                    navigate("/signup");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <UserPlus size={18} /> {t("navbar.sign")}
                </button>
                <button
                  onClick={() => {
                    navigate("/settings");
                    setIsDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2"
                >
                  <Settings size={18} /> {t("navbar.settings")}
                </button>
              </>
            )}
          </div>
        )}

        {/* Lupa */}
        <img
          src={ssearch}
          alt="Pesquisar"
          className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${
            isScrolled || !isHome ? "invert" : "invert"
          }`}
        />

        {/* Menu Hamburguer */}
        <img
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          src={menuIcon}
          className={`h-7 cursor-pointer transition-all duration-500 ease-in-out ${
            isScrolled || !isHome ? "invert-0" : "invert"
          }`}
        />
      </div>

      {/* Menu Lateral Mobile */}
      <div
        className={`fixed top-0 left-0 w-full h-screen bg-white flex flex-col md:hidden items-center justify-center gap-6 text-gray-800 transition-all duration-500 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          className="absolute top-4 right-4"
          onClick={() => setIsMenuOpen(false)}
        >
          <img src={close} alt="Close Menu" className="h-6 w-6" />
        </button>

        {navLinks.map((link, i) => (
          <Link
            key={i}
            to={link.path}
            onClick={() => setIsMenuOpen(false)}
            className="text-lg transition-all duration-500 ease-in-out"
          >
            {t(`navbar.${link.key}`)}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;
