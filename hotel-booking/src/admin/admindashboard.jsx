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
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value ?? "—"}</p>
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
  const map = {
    CONFIRMED: "bg-green-100 text-green-700",
    PENDING_PAYMENT: "bg-yellow-100 text-yellow-700",
    PENDING_CONFIRMATION: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    REJECTED: "bg-red-100 text-red-700",
    COMPLETED: "bg-blue-100 text-blue-700",
  };
  const labels = {
    CONFIRMED: "Confirmado",
    PENDING_PAYMENT: "Aguarda pagamento",
    PENDING_CONFIRMATION: "Pendente",
    CANCELLED: "Cancelado",
    REJECTED: "Rejeitado",
    COMPLETED: "Concluído",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
};

const formatMZN = (value) => {
  if (value == null) return "—";
  return `${Number(value).toLocaleString("pt-MZ")} MZN`;
};

const AdminDashboard = () => {
  const [stats, setStats]               = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [revenueData, setRevenueData]   = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      const now = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];
      const endDate = now.toISOString().split("T")[0];
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const [overviewRes, revenueRes, bookingsRes] = await Promise.all([
        api.get("/admin/dashboard/overview", { params: { month } }),
        api.get("/admin/dashboard/revenue", { params: { startDate, endDate, groupBy: "month" } }),
        api.get("/admin/dashboard/bookings", { params: { startDate, endDate, groupBy: "month" } }),
      ]);

      const overview = overviewRes.data?.data ?? overviewRes.data;
      const revenue  = revenueRes.data?.data  ?? revenueRes.data;
      const bookings = bookingsRes.data?.data  ?? bookingsRes.data;

      setStats(overview);
      setBookingsSummary(bookings?.summary ?? null);

      // Mapear breakdown para o gráfico
      const chartData = (revenue?.breakdown ?? []).map((item) => ({
        mes: item.period ?? item.month ?? item.date,
        receita: Number(item.revenue ?? item.totalRevenue ?? 0),
        reservas: Number(item.bookings ?? item.count ?? 0),
      }));
      setRevenueData(chartData);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
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

  const byStatus = bookingsSummary?.byStatus ?? {};

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Bem-vindo ao painel 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Resumo da atividade da plataforma SoftSands.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <StatCard icon={Users}         label="Utilizadores"  value={stats?.totalUsers}              color="bg-blue-600"    sub={`${stats?.newUsersThisMonth ?? 0} novos este mês`} trend="up" />
          <StatCard icon={CalendarCheck} label="Reservas (mês)" value={stats?.totalBookingsThisMonth} color="bg-green-500" />
          <StatCard icon={Clock}         label="Activas"       value={stats?.activeBookings}          color="bg-yellow-500"  sub="Em curso" />
          <StatCard icon={TrendingUp}    label="Receita líquida" value={formatMZN(stats?.netRevenue)} color="bg-emerald-500" trend="up" />
          <StatCard icon={TrendingDown}  label="Reembolsos"    value={formatMZN(stats?.totalRefunds)} color="bg-red-500"     trend="down" />
          <StatCard icon={Home}          label="Ocupação média" value={stats?.averageOccupancy != null ? `${stats.averageOccupancy}%` : "—"} color="bg-indigo-500" />
        </div>

        {/* Resumo de reservas por estado */}
        {bookingsSummary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{bookingsSummary.total}</p>
            </div>
            {Object.entries(byStatus).map(([status, count]) => (
              <div key={status} className="bg-white rounded-xl border border-gray-100 p-3 text-center">
                <p className="text-xs text-gray-500">{status}</p>
                <p className="text-lg font-bold text-gray-900">{count}</p>
              </div>
            ))}
            <div className="bg-white rounded-xl border border-gray-100 p-3 text-center">
              <p className="text-xs text-gray-500">Valor médio</p>
              <p className="text-lg font-bold text-gray-900">{formatMZN(bookingsSummary.averageValue)}</p>
            </div>
          </div>
        )}

        {/* Gráfico */}
        {revenueData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">Receita & Reservas (últimos 6 meses)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                  formatter={(v, name) => [name === "receita" ? formatMZN(v) : v, name === "receita" ? "Receita" : "Reservas"]}
                />
                <Legend formatter={(v) => v === "receita" ? "Receita" : "Reservas"} wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="receita"  fill="#2563eb" radius={[4,4,0,0]} />
                <Bar dataKey="reservas" fill="#bfdbfe" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Link para reservas */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
          <Link to="/admin/reservas" className="text-blue-600 hover:underline font-semibold text-sm">
            Ver todas as reservas →
          </Link>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;