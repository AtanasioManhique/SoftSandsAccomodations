import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Users, CalendarCheck, Clock, TrendingUp, TrendingDown, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

// ── Stat card ─────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, trend, color }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-start gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon size={18} className="text-white" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-gray-500 font-medium uppercase tracking-wide truncate">{label}</p>
      <p className="text-xl font-bold text-gray-900 mt-0.5">{value ?? "—"}</p>
      {sub && (
        <p className={`text-xs mt-0.5 flex items-center gap-1 ${
          trend === "up" ? "text-green-600" : trend === "down" ? "text-red-500" : "text-gray-400"
        }`}>
          {trend === "up"   && <TrendingUp   size={11} />}
          {trend === "down" && <TrendingDown size={11} />}
          <span className="truncate">{sub}</span>
        </p>
      )}
    </div>
  </div>
);

// ── Configuração dos estados de reserva ───────────────────────
const STATUS_CONFIG = {
  pending_payment:      { emoji: "🟡", label: "Aguarda pagamento",   bg: "bg-yellow-50",  border: "border-yellow-200", text: "text-yellow-700" },
  PENDING_PAYMENT:      { emoji: "🟡", label: "Aguarda pagamento",   bg: "bg-yellow-50",  border: "border-yellow-200", text: "text-yellow-700" },
  pending_confirmation: { emoji: "🟠", label: "Aguarda confirmação", bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700" },
  PENDING_CONFIRMATION: { emoji: "🟠", label: "Aguarda confirmação", bg: "bg-orange-50",  border: "border-orange-200", text: "text-orange-700" },
  confirmed:            { emoji: "🟢", label: "Confirmadas",         bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700"  },
  CONFIRMED:            { emoji: "🟢", label: "Confirmadas",         bg: "bg-green-50",   border: "border-green-200",  text: "text-green-700"  },
  completed:            { emoji: "🔵", label: "Concluídas",          bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700"   },
  COMPLETED:            { emoji: "🔵", label: "Concluídas",          bg: "bg-blue-50",    border: "border-blue-200",   text: "text-blue-700"   },
  cancelled:            { emoji: "🔴", label: "Canceladas",          bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700"    },
  CANCELLED:            { emoji: "🔴", label: "Canceladas",          bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700"    },
  rejected:             { emoji: "🔴", label: "Rejeitadas",          bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700"    },
  REJECTED:             { emoji: "🔴", label: "Rejeitadas",          bg: "bg-red-50",     border: "border-red-200",    text: "text-red-700"    },
};

const STATUS_ORDER = [
  "pending_payment", "PENDING_PAYMENT",
  "pending_confirmation", "PENDING_CONFIRMATION",
  "confirmed", "CONFIRMED",
  "completed", "COMPLETED",
  "cancelled", "CANCELLED",
  "rejected", "REJECTED",
];

const formatMZN = (value) => {
  if (value == null) return "—";
  return `${Number(value).toLocaleString("pt-MZ")} MZN`;
};

// ── Dashboard ─────────────────────────────────────────────────
const AdminDashboard = () => {
  const [stats,           setStats]           = useState(null);
  const [bookingsSummary, setBookingsSummary] = useState(null);
  const [revenueData,     setRevenueData]     = useState([]);
  const [loading,         setLoading]         = useState(true);

  useEffect(() => {
    loadDashboard();
    // Actualiza automaticamente a cada 60 segundos
    const interval = setInterval(loadDashboard, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const now       = new Date();
      const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString().split("T")[0];
      const endDate   = now.toISOString().split("T")[0];
      const month     = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

      const [overviewRes, revenueRes, bookingsRes] = await Promise.all([
        api.get("/admin/dashboard/overview", { params: { month } }),
        api.get("/admin/dashboard/revenue",  { params: { startDate, endDate, groupBy: "month" } }),
        api.get("/admin/dashboard/bookings", { params: { startDate, endDate, groupBy: "month" } }),
      ]);

      setStats(overviewRes.data?.data ?? {});
      setBookingsSummary(bookingsRes.data?.data?.summary ?? null);

      const chartData = (revenueRes.data?.data?.breakdown ?? []).map((item) => ({
        mes:      item.period,
        receita:  Number(item.revenue  ?? 0),
        reservas: Number(item.bookings ?? 0),
      }));
      setRevenueData(chartData);
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err.response?.data ?? err.message ?? err);
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

  // Constrói lista de estados sem duplicar labels (upper/lowercase)
  const byStatus   = bookingsSummary?.byStatus ?? {};
  const seenLabels = new Set();

  const statusEntries = STATUS_ORDER
    .filter((key) => byStatus[key] != null)
    .filter((key) => {
      const cfg = STATUS_CONFIG[key];
      if (!cfg || seenLabels.has(cfg.label)) return false;
      seenLabels.add(cfg.label);
      return true;
    })
    .map((key) => ({ key, count: byStatus[key], ...STATUS_CONFIG[key] }));

  // Estados desconhecidos que o backend possa devolver
  const unknownEntries = Object.entries(byStatus)
    .filter(([key]) => !STATUS_CONFIG[key])
    .map(([key, count]) => ({
      key, count,
      emoji: "⚪", label: key,
      bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-600",
    }));

  const allStatusEntries = [...statusEntries, ...unknownEntries];

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div>
          <h2 className="text-lg font-bold text-gray-900">Bem-vindo ao painel 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">Resumo da atividade da plataforma SoftSands.</p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          <StatCard icon={Users}         label="Utilizadores"   value={stats?.totalUsers}              color="bg-blue-600"    sub={`${stats?.newUsersThisMonth ?? 0} novos este mês`} trend="up" />
          <StatCard icon={CalendarCheck} label="Reservas (mês)" value={stats?.totalBookingsThisMonth}  color="bg-green-500" />
          <StatCard icon={Clock}         label="Activas"         value={stats?.activeBookings}          color="bg-yellow-500"  sub="Em curso" />
          <StatCard icon={TrendingUp}    label="Receita líquida" value={formatMZN(stats?.netRevenue)}   color="bg-emerald-500" trend="up" />
          <StatCard icon={TrendingDown}  label="Reembolsos"      value={formatMZN(stats?.totalRefunds)} color="bg-red-500"     trend="down" />
          <StatCard icon={Home}          label="Ocupação média"  value={stats?.averageOccupancy != null ? `${stats.averageOccupancy}%` : "—"} color="bg-indigo-500" />
        </div>

        {/* ── Estado das reservas ────────────────────────────── */}
        {bookingsSummary && allStatusEntries.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

            {/* Cabeçalho com totais */}
            <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
              <h3 className="text-sm font-semibold text-gray-800">Estado das reservas</h3>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span>
                  Total:{" "}
                  <span className="font-bold text-gray-900 text-sm">
                    {bookingsSummary.total ?? 0}
                  </span>
                </span>
                {bookingsSummary.averageValue != null && (
                  <span>
                    Valor médio:{" "}
                    <span className="font-bold text-gray-900">
                      {formatMZN(bookingsSummary.averageValue)}
                    </span>
                  </span>
                )}
              </div>
            </div>

            {/* Cards por estado */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
              {allStatusEntries.map(({ key, count, emoji, label, bg, border, text }) => (
                <div
                  key={key}
                  className={`flex flex-col gap-1.5 rounded-xl border px-3 py-3 ${bg} ${border}`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-base leading-none">{emoji}</span>
                    <span className={`text-xs font-medium leading-tight ${text}`}>{label}</span>
                  </div>
                  <p className={`text-2xl font-bold ${text}`}>{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gráfico receita & reservas */}
        {revenueData.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-4">
              Receita & Reservas (últimos 6 meses)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenueData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="mes"  tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
                <Tooltip
                  contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                  formatter={(v, name) => [
                    name === "receita" ? formatMZN(v) : v,
                    name === "receita" ? "Receita" : "Reservas",
                  ]}
                />
                <Legend
                  formatter={(v) => v === "receita" ? "Receita" : "Reservas"}
                  wrapperStyle={{ fontSize: "11px" }}
                />
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