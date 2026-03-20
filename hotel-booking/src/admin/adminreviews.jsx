// src/admin/AdminReviews.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Check, Trash2, Star, Search, X } from "lucide-react";

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1,2,3,4,5].map((s) => (
      <Star key={s} size={12} className={s <= Math.round(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} />
    ))}
  </div>
);

const AdminReviews = () => {
  const [reviews, setReviews]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filter, setFilter]             = useState("todos");
  const [search, setSearch]             = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { loadReviews(); }, []);

  const loadReviews = async () => {
    try {
      const res = await api.get("/admin/reviews");
      setReviews(res.data?.data ?? res.data ?? []);
    } catch {
      setReviews([
        { id: "r1", user_name: "Ana Silva",    user_location: "Maputo",   house: "Casa do Mar",    stars: 5, comment: "Lugar fantástico! Voltamos com certeza.", date: "2025-08-01", status: "approved" },
        { id: "r2", user_name: "João Matos",   user_location: "Portugal", house: "Villa Sunset",   stars: 4, comment: "Excelente mas o wi-fi era fraco.",        date: "2025-08-05", status: "pending"  },
        { id: "r3", user_name: "Maria Costa",  user_location: "Brasil",   house: "Palhota Tofo",   stars: 2, comment: "Casa suja e mal equipada.",               date: "2025-08-10", status: "pending"  },
        { id: "r4", user_name: "Pedro Nunes",  user_location: "Maputo",   house: "Casa Bilene",    stars: 5, comment: "Perfeito para família! Muito tranquilo.",  date: "2025-08-12", status: "approved" },
        { id: "r5", user_name: "Beatriz Lima", user_location: "Beira",    house: "Cabana Malongane", stars: 3, comment: "OK mas esperava mais pela vista.",       date: "2025-08-15", status: "pending"  },
      ]);
    } finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/reviews/${id}`, { status: "approved" });
      setReviews((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" } : r));
    } catch { alert("Erro ao aprovar review."); }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/reviews/${id}`);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch { alert("Erro ao eliminar review."); }
    finally { setDeleteConfirm(null); }
  };

  const filtered = reviews.filter((r) => {
    const matchFilter = filter === "todos" || r.status === filter;
    const matchSearch = !search || r.user_name.toLowerCase().includes(search.toLowerCase()) || r.house.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const tabs = [
    { key: "todos",    label: "Todas",     count: reviews.length },
    { key: "pending",  label: "Pendentes", count: reviews.filter((r) => r.status === "pending").length },
    { key: "approved", label: "Aprovadas", count: reviews.filter((r) => r.status === "approved").length },
  ];

  return (
    <AdminLayout>
      <div className="space-y-4">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Moderação de Reviews</h2>
            <p className="text-sm text-gray-500 mt-0.5">Aprove ou remova avaliações.</p>
          </div>
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-48 bg-white"
            />
          </div>
        </div>

        {/* Tabs scroll horizontal mobile */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setFilter(tab.key)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                filter === tab.key ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600"
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
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400 text-sm">Nenhuma review encontrada.</div>
            )}
            {filtered.map((r) => (
              <div key={r.id} className={`bg-white rounded-2xl border shadow-sm p-4 ${r.status === "pending" ? "border-yellow-200 bg-yellow-50/30" : "border-gray-100"}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    {/* Header */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-gray-900 text-sm">{r.user_name}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-gray-500">{r.user_location}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs text-blue-600 font-medium truncate">{r.house}</span>
                    </div>
                    {/* Badge + data */}
                    <div className="flex items-center gap-2">
                      {r.status === "pending" ? (
                        <span className="bg-yellow-100 text-yellow-700 text-xs font-semibold px-2 py-0.5 rounded-full">Pendente</span>
                      ) : (
                        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">Aprovada</span>
                      )}
                      <span className="text-xs text-gray-400">{new Date(r.date).toLocaleDateString("pt-PT")}</span>
                    </div>
                    <StarDisplay rating={r.stars} />
                    <p className="text-sm text-gray-700 leading-relaxed">{r.comment}</p>
                  </div>

                  {/* Ações — verticais no mobile */}
                  <div className="flex flex-col gap-1.5 flex-shrink-0">
                    {r.status === "pending" && (
                      <button onClick={() => handleApprove(r.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs font-semibold transition">
                        <Check size={12} /> <span className="hidden sm:inline">Aprovar</span>
                      </button>
                    )}
                    <button onClick={() => setDeleteConfirm(r.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-lg text-xs font-semibold transition">
                      <Trash2 size={12} /> <span className="hidden sm:inline">Remover</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold">Remover review?</h3>
            <p className="text-sm text-gray-500">Esta avaliação será eliminada permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm">Remover</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReviews;