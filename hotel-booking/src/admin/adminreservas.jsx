// src/admin/AdminReservas.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Check, X, Eye, Search } from "lucide-react";

const StatusBadge = ({ status }) => {
  const map    = { confirmado: "bg-green-100 text-green-700", pendente: "bg-yellow-100 text-yellow-700", cancelado: "bg-red-100 text-red-700" };
  const labels = { confirmado: "Confirmado", pendente: "Pendente", cancelado: "Cancelado" };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${map[status] ?? "bg-gray-100 text-gray-500"}`}>
      {labels[status] ?? status}
    </span>
  );
};

const AdminReservas = () => {
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState("todos");
  const [search, setSearch]           = useState("");
  const [actionLoading, setActionLoading] = useState(null);
  const [selected, setSelected]       = useState(null);

  useEffect(() => { loadBookings(); }, []);

  const loadBookings = async () => {
    try {
      const res = await api.get("/admin/bookings");
      setBookings(res.data?.data ?? res.data ?? []);
    } catch {
      setBookings([
        { id: "BKG-001", guestName: "Ana Silva",       guestEmail: "ana@email.com",    house: "Casa do Mar",      checkIn: "2025-09-01", checkOut: "2025-09-05", guests: 2, status: "confirmado", total: "2.200 MZN", method: "M-Pesa" },
        { id: "BKG-002", guestName: "João Matos",      guestEmail: "joao@email.com",   house: "Villa Sunset",     checkIn: "2025-09-03", checkOut: "2025-09-07", guests: 4, status: "pendente",   total: "3.400 MZN", method: "eMola"  },
        { id: "BKG-003", guestName: "Maria Costa",     guestEmail: "maria@email.com",  house: "Palhota Tofo",     checkIn: "2025-09-10", checkOut: "2025-09-12", guests: 2, status: "cancelado",  total: "1.800 MZN", method: "M-Pesa" },
        { id: "BKG-004", guestName: "Pedro Nunes",     guestEmail: "pedro@email.com",  house: "Casa Bilene",      checkIn: "2025-09-15", checkOut: "2025-09-20", guests: 6, status: "pendente",   total: "4.000 MZN", method: "eMola"  },
        { id: "BKG-005", guestName: "Beatriz Lima",    guestEmail: "bea@email.com",    house: "Cabana Malongane", checkIn: "2025-09-18", checkOut: "2025-09-21", guests: 3, status: "confirmado", total: "2.700 MZN", method: "M-Pesa" },
        { id: "BKG-006", guestName: "Carlos Ferreira", guestEmail: "carlos@email.com", house: "Casa Mamoli",      checkIn: "2025-09-22", checkOut: "2025-09-25", guests: 2, status: "pendente",   total: "1.500 MZN", method: "M-Pesa" },
      ]);
    } finally { setLoading(false); }
  };

  const handleAction = async (id, action) => {
    setActionLoading(id + action);
    try {
      await api.patch(`/admin/bookings/${id}`, { status: action === "approve" ? "confirmado" : "cancelado" });
      setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: action === "approve" ? "confirmado" : "cancelado" } : b));
      if (selected?.id === id) setSelected((prev) => ({ ...prev, status: action === "approve" ? "confirmado" : "cancelado" }));
    } catch { alert("Erro ao atualizar reserva."); }
    finally { setActionLoading(null); }
  };

  const filtered = bookings.filter((b) => {
    const matchFilter = filter === "todos" || b.status === filter;
    const matchSearch = !search || b.guestName.toLowerCase().includes(search.toLowerCase()) || b.house.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const tabs = [
    { key: "todos",      label: "Todas",       count: bookings.length },
    { key: "pendente",   label: "Pendentes",   count: bookings.filter((b) => b.status === "pendente").length },
    { key: "confirmado", label: "Confirmadas", count: bookings.filter((b) => b.status === "confirmado").length },
    { key: "cancelado",  label: "Canceladas",  count: bookings.filter((b) => b.status === "cancelado").length },
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

        {/* Tabs — scroll horizontal mobile */}
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
                      <p className="font-semibold text-gray-900 text-sm truncate">{b.guestName}</p>
                      <p className="text-xs text-gray-400">{b.guestEmail}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div><span className="text-gray-400">Casa:</span> <span className="font-medium text-gray-700">{b.house}</span></div>
                    <div><span className="text-gray-400">Hóspedes:</span> <span className="font-medium text-gray-700">{b.guests}</span></div>
                    <div><span className="text-gray-400">Check-in:</span> <span className="font-medium text-gray-700">{b.checkIn}</span></div>
                    <div><span className="text-gray-400">Check-out:</span> <span className="font-medium text-gray-700">{b.checkOut}</span></div>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                    <span className="font-bold text-gray-900 text-sm">{b.total}</span>
                    <div className="flex gap-2">
                      <button onClick={() => setSelected(b)} className="p-2 rounded-lg bg-blue-50 text-blue-500">
                        <Eye size={15} />
                      </button>
                      {b.status === "pendente" && (
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
                      <th className="text-left px-5 py-3">ID</th>
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
                        <td className="px-5 py-3 font-mono text-xs text-gray-400">{b.id}</td>
                        <td className="px-5 py-3">
                          <p className="font-medium text-gray-900">{b.guestName}</p>
                          <p className="text-xs text-gray-400">{b.guestEmail}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-600">{b.house}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">{b.checkIn} → {b.checkOut}</td>
                        <td className="px-5 py-3 font-semibold text-gray-800">{b.total}</td>
                        <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setSelected(b)} className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-500 transition"><Eye size={14} /></button>
                            {b.status === "pendente" && (
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
                ["ID", <span className="font-mono font-semibold">{selected.id}</span>],
                ["Hóspede", selected.guestName],
                ["Email", <span className="text-blue-600">{selected.guestEmail}</span>],
                ["Casa", selected.house],
                ["Check-in", selected.checkIn],
                ["Check-out", selected.checkOut],
                ["Hóspedes", selected.guests],
                ["Pagamento", selected.method],
                ["Total", <span className="font-bold text-gray-900">{selected.total}</span>],
                ["Estado", <StatusBadge status={selected.status} />],
              ].map(([label, value], i) => (
                <div key={i} className={`flex justify-between items-center ${i === 0 ? "border-b pb-2" : ""} ${i === 8 ? "border-t pt-2" : ""}`}>
                  <span className="text-gray-500">{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            {selected.status === "pendente" && (
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