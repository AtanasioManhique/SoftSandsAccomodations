// src/admin/AdminLayout.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/palmtree.png";
import {
  LayoutDashboard, MapPin, Home, CalendarDays,
  Star, BarChart2, LogOut, Menu, X, ChevronRight,
  Bell, MoreHorizontal,
} from "lucide-react";

const navItems = [
  { label: "Dashboard",  icon: LayoutDashboard, to: "/admin/dashboard"  },
  { label: "Reservas",   icon: CalendarDays,    to: "/admin/reservas"   },
  { label: "Casas",      icon: Home,            to: "/admin/casas"      },
  { label: "Praias",     icon: MapPin,          to: "/admin/praias"     },
  { label: "Reviews",    icon: Star,            to: "/admin/reviews"    },
  { label: "Calendário", icon: CalendarDays,    to: "/admin/calendario" },
  { label: "Relatórios", icon: BarChart2,       to: "/admin/relatorios" },
];

// Bottom nav mostra os 4 principais + "Mais"
const bottomNavMain = navItems.slice(0, 4);

const AdminLayout = ({ children }) => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [moreOpen, setMoreOpen]       = useState(false);

  const handleLogout = () => { logout(); navigate("/login"); };
  const closeSidebar  = () => setSidebarOpen(false);

  const currentPage = navItems.find((n) => n.to === location.pathname);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo + botão fechar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-blue-700/30">
        <div className="flex items-center gap-3">
          <img src={logo} alt="SoftSands" className="h-8 brightness-200" />
          <div>
            <p className="text-white font-bold text-base leading-none">SoftSands</p>
            <p className="text-blue-200 text-xs mt-0.5">Admin Panel</p>
          </div>
        </div>
        <button onClick={closeSidebar} className="md:hidden p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-blue-700/40 transition">
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link key={item.to} to={item.to} onClick={closeSidebar}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                active ? "bg-white text-blue-600 shadow-md" : "text-blue-100 hover:bg-blue-700/40 hover:text-white"
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
              {active && <ChevronRight size={14} className="ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-4 py-4 border-t border-blue-700/30">
        <div className="flex items-center gap-3 mb-3 px-1">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? "Admin"}</p>
            <p className="text-blue-200 text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 transition">
          <LogOut size={16} /> Terminar sessão
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* ── Sidebar Desktop ── */}
      <aside className="hidden md:flex flex-col w-56 lg:w-60 bg-blue-600 fixed top-0 left-0 h-full z-40 shadow-xl">
        <SidebarContent />
      </aside>

      {/* ── Overlay Mobile ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={closeSidebar} />
      )}

      {/* ── Sidebar Mobile Drawer ── */}
      <aside className={`fixed top-0 left-0 h-full w-72 bg-blue-600 z-50 flex flex-col md:hidden transition-transform duration-300 shadow-2xl ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* ── Main Content ── */}
      <div className="flex-1 flex flex-col md:ml-56 lg:ml-60 min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 px-4 md:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-3 min-w-0">
            {/* Hamburger mobile — bem visível */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 transition shrink-0"
            >
              <Menu size={18} className="text-white" />
            </button>
            <div className="min-w-0">
              <h1 className="text-sm font-semibold text-gray-900 truncate">
                {currentPage?.label ?? "Admin"}
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Painel de Administração · SoftSands</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button className="relative p-2 rounded-xl hover:bg-gray-100 transition">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <Link to="/" className="hidden sm:block text-xs text-blue-600 hover:underline font-medium">
              Ver site →
            </Link>
            <div className="md:hidden w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.[0]?.toUpperCase() ?? "A"}
            </div>
          </div>
        </header>

        {/* Page Content — padding bottom para não sobrepor a bottom nav */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto min-w-0 pb-24 md:pb-8">
          {children}
        </main>
      </div>

      {/* ── Bottom Navigation Bar (só mobile) ── */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg">
        <div className="flex items-center justify-around px-2 py-1">

          {/* 4 itens principais */}
          {bottomNavMain.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-0 ${
                  active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <div className={`p-1.5 rounded-xl transition-all ${active ? "bg-blue-50" : ""}`}>
                  <item.icon size={20} />
                </div>
                <span className="text-xs font-medium truncate">{item.label}</span>
              </Link>
            );
          })}

          {/* Botão "Mais" — abre sheet com os restantes */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
              navItems.slice(4).some((n) => n.to === location.pathname) ? "text-blue-600" : "text-gray-400"
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${
              navItems.slice(4).some((n) => n.to === location.pathname) ? "bg-blue-50" : ""
            }`}>
              <MoreHorizontal size={20} />
            </div>
            <span className="text-xs font-medium">Mais</span>
          </button>
        </div>
      </nav>

      {/* ── Sheet "Mais" ── */}
      {moreOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 md:hidden" onClick={() => setMoreOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white rounded-t-2xl shadow-2xl p-5">
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">Mais opções</h3>
            <div className="space-y-1">
              {navItems.slice(4).map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                    {active && <ChevronRight size={14} className="ml-auto" />}
                  </Link>
                );
              })}
            </div>

            {/* Ver site + logout no sheet */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <Link to="/" onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-blue-600 font-medium hover:bg-blue-50 transition">
                ← Ver site
              </Link>
              <button onClick={() => { setMoreOpen(false); handleLogout(); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 font-medium hover:bg-red-50 transition">
                <LogOut size={16} /> Terminar sessão
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminLayout;