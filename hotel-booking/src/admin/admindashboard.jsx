// src/admin/AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Users, CalendarCheck, XCircle, Clock, TrendingUp, TrendingDown, Home, Eye } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const StatCard = ({ icon: Icon, label, value, sub, trend, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value}</p>
      {sub && (
        <p className={`text-xs mt-0.5 flex items-center gap-1 ${trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400"}`}>
          {trend === "up" && <TrendingUp size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          <span className="truncate">{sub}</span>
        </p>
      )}
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const map = { confirmado: "bg-green-100 text-green-700", pendente: "bg-yellow-100 text-yellow-700", cancelado: "bg-red-100 text-red-700" };
  const labels = { confirmado: "Confirmado", pendente: "Pendente", cancelado: "Cancelado" };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
};

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [revenueData, setRevenueData]   = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      const data = res.data?.data ?? res.data;
      setStats(data.stats);
      setRecentBookings(data.recentBookings ?? []);
      setRevenueData(data.revenueData ?? []);
    } catch {
      setStats({ totalLogins: 1240, totalReservas: 87, reservasPendentes: 9, reservasCanceladas: 12, totalCasas: 34, receitaTotal: "42.800 MZN" });
      setRecentBookings([
        { id: "BKG-001", guestName: "Ana Silva",    house: "Casa do Mar",    checkIn: "2025-09-01", checkOut: "2025-09-05", status: "confirmado", total: "2.200 MZN" },
        { id: "BKG-002", guestName: "João Matos",   house: "Villa Sunset",   checkIn: "2025-09-03", checkOut: "2025-09-07", status: "pendente",   total: "3.400 MZN" },
        { id: "BKG-003", guestName: "Maria Costa",  house: "Palhota Tofo",   checkIn: "2025-09-10", checkOut: "2025-09-12", status: "cancelado",  total: "1.800 MZN" },
        { id: "BKG-004", guestName: "Pedro Nunes",  house: "Casa Bilene",    checkIn: "2025-09-15", checkOut: "2025-09-20", status: "pendente",   total: "4.000 MZN" },
        { id: "BKG-005", guestName: "Beatriz Lima", house: "Cabana Malongane", checkIn: "2025-09-18", checkOut: "2025-09-21", status: "confirmado", total: "2.700 MZN" },
      ]);
      setRevenueData([
        { mes: "Mar", receita: 12000, reservas: 14 },
        { mes: "Abr", receita: 18500, reservas: 22 },
        { mes: "Mai", receita: 24000, reservas: 31 },
        { mes: "Jun", receita: 31000, reservas: 38 },
        { mes: "Jul", receita: 42800, reservas: 52 },
        { mes: "Ago", receita: 38200, reservas: 47 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Bem-vindo ao painel 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Resumo da atividade da plataforma SoftSands.</p>
        </div>

        {/* Stats — 2 colunas mobile, 4 desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <StatCard icon={Users}         label="Logins"        value={stats?.totalLogins}        color="bg-blue-600" />
          <StatCard icon={CalendarCheck} label="Reservas"      value={stats?.totalReservas}      color="bg-green-500" />
          <StatCard icon={Clock}         label="Pendentes"     value={stats?.reservasPendentes}  sub="Aguardam" trend="up" color="bg-yellow-500" />
          <StatCard icon={XCircle}       label="Cancelamentos" value={stats?.reservasCanceladas} color="bg-red-500" />
          <StatCard icon={Home}          label="Casas"         value={stats?.totalCasas}         color="bg-indigo-500" />
          <StatCard icon={TrendingUp}    label="Receita"       value={stats?.receitaTotal}       trend="up" color="bg-emerald-500" />
        </div>

        {/* Gráfico */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h3 className="text-sm font-semibold text-gray-800 mb-4">Receita & Reservas (últimos 6 meses)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                formatter={(v, name) => [name === "receita" ? `${v.toLocaleString()} MZN` : v, name === "receita" ? "Receita" : "Reservas"]}
              />
              <Legend formatter={(v) => v === "receita" ? "Receita" : "Reservas"} wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="receita"  fill="#2563eb" radius={[4,4,0,0]} />
              <Bar dataKey="reservas" fill="#bfdbfe" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pendentes */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">Reservas pendentes</h3>
            <Link to="/admin/reservas" className="text-xs text-blue-600 hover:underline font-medium">Ver todas →</Link>
          </div>
          <div className="space-y-2">
            {recentBookings.filter((b) => b.status === "pendente").length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">Sem reservas pendentes.</p>
            ) : (
              recentBookings.filter((b) => b.status === "pendente").map((b) => (
                <div key={b.id} className="flex items-center justify-between gap-2 bg-yellow-50 border border-yellow-100 rounded-xl p-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{b.guestName}</p>
                    <p className="text-xs text-gray-500 truncate">{b.house}</p>
                    <p className="text-xs text-gray-400">{b.checkIn} → {b.checkOut}</p>
                  </div>
                  <Link to="/admin/reservas" className="text-blue-600 shrink-0">
                    <Eye size={15} />
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Tabela últimas reservas — cards no mobile */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-semibold text-gray-800">Últimas reservas</h3>
            <Link to="/admin/reservas" className="text-xs text-blue-600 hover:underline font-medium">Ver todas →</Link>
          </div>

          {/* Cards mobile */}
          <div className="md:hidden divide-y divide-gray-50">
            {recentBookings.map((b) => (
              <div key={b.id} className="p-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 text-sm">{b.guestName}</span>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-xs text-gray-500">{b.house}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">{b.checkIn} → {b.checkOut}</span>
                  <span className="text-sm font-semibold text-gray-800">{b.total}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Tabela desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">ID</th>
                  <th className="text-left px-5 py-3">Hóspede</th>
                  <th className="text-left px-5 py-3">Casa</th>
                  <th className="text-left px-5 py-3">Check-in</th>
                  <th className="text-left px-5 py-3">Total</th>
                  <th className="text-left px-5 py-3">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50/60 transition">
                    <td className="px-5 py-3 font-mono text-xs text-gray-400">{b.id}</td>
                    <td className="px-5 py-3 font-medium text-gray-900">{b.guestName}</td>
                    <td className="px-5 py-3 text-gray-600">{b.house}</td>
                    <td className="px-5 py-3 text-gray-500">{b.checkIn}</td>
                    <td className="px-5 py-3 font-semibold text-gray-800">{b.total}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;