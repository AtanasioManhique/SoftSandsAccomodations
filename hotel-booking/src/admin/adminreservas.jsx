// src/admin/AdminReservas.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Check, X, Eye, Search } from "lucide-react";
import { formatCurrency } from "../context/utils/currency";

const STATUS_MAP = {
  pending_payment:      { bg: "bg-yellow-100 text-yellow-700", label: "Aguarda pagamento" },
  pending_confirmation: { bg: "bg-orange-100 text-orange-700", label: "Aguarda confirmação" },
  confirmed:            { bg: "bg-green-100 text-green-700",   label: "Confirmado" },
  cancelled:            { bg: "bg-red-100 text-red-700",       label: "Cancelado" },
  rejected:             { bg: "bg-red-100 text-red-700",       label: "Rejeitado" },
  completed:            { bg: "bg-blue-100 text-blue-700",     label: "Concluído" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? { bg: "bg-gray-100 text-gray-500", label: status };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${s.bg}`}>
      {s.label}
    </span>
  );
};

const formatDate = (iso) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-MZ", { day: "2-digit", month: "short", year: "numeric" });
};

const AdminReservas = () => {
  const [bookings, setBookings]           = useState([]);
  const [pagination, setPagination]       = useState(null);
  const [loading, setLoading]             = useState(true);
  const [filter, setFilter]               = useState("todos");
  const [search, setSearch]               = useState("");
  const [page, setPage]                   = useState(1);
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected]           = useState(null);

  useEffect(() => { loadBookings(); }, [page]);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/bookings", { params: { page, limit: 20 } });
      setBookings(res.data?.data ?? []);
      setPagination(res.data?.pagination ?? null);
    } catch (err) {
      console.error("Erro ao carregar reservas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      const newStatus = action === "approve" ? "confirmed" : "rejected";
      await api.patch(`/admin/bookings/${id}`, { status: newStatus });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: newStatus } : b));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Erro ao atualizar reserva:", err);
      alert("Erro ao atualizar reserva.");
    } finally {
      setActionLoading(null);
    }
  };

  const isPending = (status) => status === "pending_payment" || status === "pending_confirmation";

  const filtered = bookings.filter((b) => {
    const matchFilter =
      filter === "todos" ||
      (filter === "pendente" && isPending(b.status)) ||
      (filter !== "pendente" && b.status === filter);

    const searchLower = search.toLowerCase();
    const matchSearch =
      !search ||
      b.user?.name?.toLowerCase().includes(searchLower) ||
      b.user?.email?.toLowerCase().includes(searchLower) ||
      b.accommodation?.name?.toLowerCase().includes(searchLower) ||
      b.id.toLowerCase().includes(searchLower);

    return matchFilter && matchSearch;
  });

  const tabs = [
    { key: "todos",     label: "Todas",       count: bookings.length },
    { key: "pendente",  label: "Pendentes",   count: bookings.filter((b) => isPending(b.status)).length },
    { key: "confirmed", label: "Confirmadas", count: bookings.filter((b) => b.status === "confirmed").length },
    { key: "cancelled", label: "Canceladas",  count: bookings.filter((b) => b.status === "cancelled" || b.status === "rejected").length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Gestão de Reservas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Aprove ou rejeite reservas pendentes.</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text" placeholder="Pesquisar..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-56 bg-white"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-300"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${filter === tab.key ? "bg-blue-500" : "bg-gray-100"}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            Nenhuma reserva encontrada.
          </div>
        ) : (
          <>
            {/* Cards mobile */}
            <div className="md:hidden space-y-3">
              {filtered.map((b) => (
                <div key={b.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.user?.name}</p>
                      <p className="text-xs text-gray-400">{b.user?.email}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div><span className="text-gray-400">Casa:</span> <span className="font-medium text-gray-700">{b.accommodation?.name}</span></div>
                    <div><span className="text-gray-400">Hóspedes:</span> <span className="font-medium text-gray-700">{b.guests}</span></div>
                    <div><span className="text-gray-400">Check-in:</span> <span className="font-medium text-gray-700">{formatDate(b.checkInDate)}</span></div>
                    <div><span className="text-gray-400">Check-out:</span> <span className="font-medium text-gray-700">{formatDate(b.checkOutDate)}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="font-bold text-gray-900 text-sm">{formatCurrency(b.totalPrice, b.currency)}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(b)} className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <Eye size={15} />
                      </button>
                      {isPending(b.status) && (
                        <>
                          <button onClick={() => handleAction(b.id, "approve")} disabled={!!actionLoading} className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40">
                            <Check size={13} /> Aprovar
                          </button>
                          <button onClick={() => handleAction(b.id, "cancel")} disabled={!!actionLoading} className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-40">
                            <X size={13} /> Rejeitar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela desktop */}
            <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      <th className="text-left px-5 py-3">Hóspede</th>
                      <th className="text-left px-5 py-3">Casa</th>
                      <th className="text-left px-5 py-3">Datas</th>
                      <th className="text-left px-5 py-3">Total</th>
                      <th className="text-left px-5 py-3">Estado</th>
                      <th className="text-left px-5 py-3">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{b.user?.name}</p>
                          <p className="text-xs text-gray-400">{b.user?.email}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{b.accommodation?.name}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{formatDate(b.checkInDate)} → {formatDate(b.checkOutDate)}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{formatCurrency(b.totalPrice, b.currency)}</td>
                        <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                            {isPending(b.status) && (
                              <>
                                <button onClick={() => handleAction(b.id, "approve")} disabled={!!actionLoading} className="p-1.5 rounded-lg hover:bg-green-50 text-green-500 transition disabled:opacity-40"><Check size={14} /></button>
                                <button onClick={() => handleAction(b.id, "cancel")} disabled={!!actionLoading} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition disabled:opacity-40"><X size={14} /></button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginação */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={!pagination.hasPreviousPage}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-500">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition"
                >
                  Seguinte →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal detalhe */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">Detalhe da Reserva</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Hóspede",      selected.user?.name],
                ["Email",        <span className="text-blue-600">{selected.user?.email}</span>],
                ["Casa",         selected.accommodation?.name],
                ["Localização",  selected.accommodation?.location],
                ["Check-in",     formatDate(selected.checkInDate)],
                ["Check-out",    formatDate(selected.checkOutDate)],
                ["Hóspedes",     selected.guests],
                ["Total",        <span className="font-bold text-gray-900">{formatCurrency(selected.totalPrice, selected.currency)}</span>],
                ["Pagamento",    <StatusBadge status={selected.paymentStatus === "pending" ? "pending_payment" : selected.paymentStatus} />],
                ["Estado",       <StatusBadge status={selected.status} />],
                ...(selected.specialRequests ? [["Pedidos especiais", selected.specialRequests]] : []),
                ...(selected.adminNotes ? [["Notas admin", selected.adminNotes]] : []),
                ...(selected.cancelledReason ? [["Motivo cancelamento", selected.cancelledReason]] : []),
                ...(selected.rejectionReason ? [["Motivo rejeição", selected.rejectionReason]] : []),
                ["Criado em",    formatDate(selected.createdAt)],
              ].map(([label, value], i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-500">{label}</span>
                  <span className="text-right">{value}</span>
                </div>
              ))}
            </div>
            {isPending(selected.status) && (
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleAction(selected.id, "approve")} className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
                  <Check size={15} /> Aprovar
                </button>
                <button onClick={() => handleAction(selected.id, "cancel")} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition text-sm flex items-center justify-center gap-2">
                  <X size={15} /> Rejeitar
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReservas;