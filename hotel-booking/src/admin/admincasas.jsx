// src/admin/AdminCasas.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Plus, Pencil, Trash2, X, MapPin, Search, ChevronLeft, ChevronRight } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// 🚧 DEV — Simulação frontend via localStorage
// Remove este bloco quando o backend estiver pronto.
const DEV_KEY = "dev_casas_admin";
const devGetCasas = () => {
  try { return JSON.parse(localStorage.getItem(DEV_KEY)) || []; }
  catch { return []; }
};
const devSaveCasas = (casas) => {
  localStorage.setItem(DEV_KEY, JSON.stringify(casas));
  window.dispatchEvent(new Event("dev_casas_updated"));
};
// 🚧 fim bloco DEV ────────────────────────────────────────────

const AMENITY_ICONS = [
  { name: "Wi-Fi",               icon: "/icons/wi-fi.png"           },
  { name: "Piscina Privada",     icon: "/icons/swimming.png"        },
  { name: "Estacionamento",      icon: "/icons/car.png"             },
  { name: "Cozinha Equipada",    icon: "/icons/kitchen.png"         },
  { name: "Ar-Condicionado",     icon: "/icons/air-conditioner.png" },
  { name: "Ventilação",          icon: "/icons/fan.png"             },
  { name: "Área de Churrasco",   icon: "/icons/barbecue.png"        },
  { name: "Vista ao Mar",        icon: "/icons/sunset.png"          },
  { name: "Sala Mobilada",       icon: "/icons/sofa.png"            },
  { name: "Serviços de Limpeza", icon: "/icons/clean.png"           },
];

const ITEMS_PER_PAGE = 10;

const emptyForm = {
  location:    "",
  description: "",
  price: { low_season: "", high_season: "", currency: "ZAR" },
  bedroom:     1,
  capacity:    2,
  rating:      5,
  coordinates: { lat: "", lng: "" },
  amenities:   [],
  images:      [],
};

const AdminCasas = () => {
  const [casas, setCasas]                 = useState([]);
  const [praias, setPraias]               = useState([]);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [editingId, setEditingId]         = useState(null);
  const [form, setForm]                   = useState(emptyForm);
  const [novaPraia, setNovaPraia]         = useState("");
  const [saving, setSaving]               = useState(false);
  const [search, setSearch]               = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // ── Paginação ─────────────────────────────────────────────
  const [currentPage, setCurrentPage]     = useState(1);
  // ─────────────────────────────────────────────────────────

  useEffect(() => { loadData(); }, []);

  // Volta à página 1 sempre que a pesquisa muda
  useEffect(() => { setCurrentPage(1); }, [search]);

  const loadData = async () => {
    try {
      // BACKEND: GET /api/admin/accommodations
      const res = await api.get("/admin/accommodations");
      const data = res.data?.data ?? res.data ?? [];
      const todas = Array.isArray(data) ? data : [];
      setCasas(todas);
      setPraias([...new Set(todas.map((c) => c.location).filter(Boolean))]);
    } catch {
      // 🚧 DEV — JSON local + localStorage
      try {
        const res = await fetch("/data/casas.json");
        const jsonCasas = await res.json();
        const devCasas = devGetCasas();
        const todas = [...jsonCasas, ...devCasas];
        setCasas(todas);
        setPraias([...new Set(todas.map((c) => c.location).filter(Boolean))]);
      } catch (err) {
        console.error("Erro ao carregar casas:", err);
      }
      // 🚧 fim DEV
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setNovaPraia("");
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (casa) => {
    setForm({
      location:    casa.location    ?? "",
      description: casa.description ?? "",
      price: {
        low_season:  casa.price?.low_season  ?? "",
        high_season: casa.price?.high_season ?? "",
        currency:    casa.price?.currency    ?? "ZAR",
      },
      bedroom:     casa.bedroom  ?? 1,
      capacity:    casa.capacity ?? 2,
      rating:      casa.rating   ?? 5,
      coordinates: { lat: casa.coordinates?.lat ?? "", lng: casa.coordinates?.lng ?? "" },
      amenities:   casa.amenities ?? [],
      images:      casa.image     ?? [],
    });
    setNovaPraia("");
    setEditingId(casa.id);
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const locationFinal = novaPraia.trim() || form.location;
    if (!locationFinal) { alert("Seleciona uma praia ou escreve o nome de uma nova."); return; }
    if (!form.price.low_season || !form.price.high_season) { alert("Os preços de época baixa e alta são obrigatórios."); return; }
    setSaving(true);

    const payload = {
      location:    locationFinal,
      description: form.description,
      price: {
        low_season:  Number(form.price.low_season),
        high_season: Number(form.price.high_season),
        currency:    form.price.currency,
      },
      bedroom:     Number(form.bedroom),
      capacity:    Number(form.capacity),
      rating:      Number(form.rating),
      coordinates: form.coordinates.lat && form.coordinates.lng
        ? { lat: Number(form.coordinates.lat), lng: Number(form.coordinates.lng) }
        : null,
      amenities: form.amenities,
      image:     form.images,
    };

    try {
      if (editingId) {
        // BACKEND: PUT /api/admin/accommodations/:id
        await api.put(`/admin/accommodations/${editingId}`, payload);
        setCasas((prev) => prev.map((c) => c.id === editingId ? { ...c, ...payload, id: editingId } : c));
      } else {
        // BACKEND: POST /api/admin/accommodations
        const res = await api.post("/admin/accommodations", payload);
        const nova = res.data?.data ?? res.data;
        setCasas((prev) => [...prev, nova]);
        if (!praias.includes(locationFinal)) setPraias((prev) => [...prev, locationFinal]);
      }
    } catch {
      // 🚧 DEV
      const devCasas = devGetCasas();
      if (editingId) {
        const atualizadas = devCasas.map((c) => c.id === editingId ? { ...c, ...payload } : c);
        const eraNoJson = !devCasas.find((c) => c.id === editingId);
        if (eraNoJson) atualizadas.push({ ...payload, id: editingId, _devOverride: true });
        devSaveCasas(atualizadas);
      } else {
        const novaCasa = { ...payload, id: `dev-${Date.now()}`, _devAdded: true };
        devSaveCasas([...devCasas, novaCasa]);
      }
      await loadData();
      // 🚧 fim DEV
    } finally {
      setSaving(false);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      // BACKEND: DELETE /api/admin/accommodations/:id
      await api.delete(`/admin/accommodations/${id}`);
      setCasas((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // 🚧 DEV
      const devCasas = devGetCasas();
      devSaveCasas(devCasas.filter((c) => c.id !== id));
      setCasas((prev) => prev.filter((c) => c.id !== id));
      // 🚧 fim DEV
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleAmenity = (amenity) => {
    setForm((prev) => {
      const exists = prev.amenities.find((a) => a.name === amenity.name);
      return {
        ...prev,
        amenities: exists
          ? prev.amenities.filter((a) => a.name !== amenity.name)
          : [...prev.amenities, amenity],
      };
    });
  };

  // ── Lógica de paginação ───────────────────────────────────
  const filtered = casas.filter(
    (c) => !search || c.location?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex  = (currentPage - 1) * ITEMS_PER_PAGE;
  const casasPagina = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Gera array de páginas a mostrar (máx 5 botões)
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 3) return [1, 2, 3, 4, 5];
    if (currentPage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
  };
  // ─────────────────────────────────────────────────────────

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestão de Casas</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Casas criadas aqui aparecem automaticamente no explorar.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por praia..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-52 bg-white"
              />
            </div>
            <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm shrink-0">
              <Plus size={16} /> Nova Casa
            </button>
          </div>
        </div>

        {/* Banner DEV */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-xs text-yellow-800 flex items-start gap-2">
          <span className="font-bold shrink-0">🚧 Modo DEV:</span>
          <span>Casas adicionadas ficam no <strong>localStorage</strong> e aparecem no site automaticamente. Remove este banner quando o backend estiver pronto.</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Info + Paginação (acima das casas) */}
            {filtered.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                {/* Contagem */}
                <p className="text-sm text-gray-500">
                  A mostrar{" "}
                  <span className="font-semibold text-gray-700">
                    {startIndex + 1}–{Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)}
                  </span>{" "}
                  de{" "}
                  <span className="font-semibold text-gray-700">{filtered.length}</span>{" "}
                  casas
                </p>

                {/* Botões de página */}
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    {/* Anterior */}
                    <button
                      onClick={() => goToPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white"
                    >
                      <ChevronLeft size={15} />
                    </button>

                    {/* Números */}
                    {getPageNumbers().map((page) => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition border ${
                          page === currentPage
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                            : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* Próxima */}
                    <button
                      onClick={() => goToPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Grid de casas — só a página atual */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {casasPagina.map((casa) => (
                <div key={casa.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${casa._devAdded ? "border-yellow-300" : "border-gray-100"}`}>
                  <div className="h-36 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center relative">
                    {casa.image?.[0] ? (
                      <img src={casa.image[0]} alt={casa.location} className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-5xl">🏠</div>
                    )}
                    {casa._devAdded && (
                      <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full">DEV</div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button onClick={() => openEdit(casa)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow-sm">
                        <Pencil size={13} className="text-blue-600" />
                      </button>
                      {casa._devAdded && (
                        <button onClick={() => setDeleteConfirm(casa.id)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow-sm">
                          <Trash2 size={13} className="text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <MapPin size={11} /> {casa.location}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-blue-600 font-bold text-sm">
                        {casa.price?.low_season?.toLocaleString()} {casa.price?.currency ?? "ZAR"} / época baixa
                      </span>
                      <span className="text-gray-400 text-xs">
                        {casa.price?.high_season?.toLocaleString()} {casa.price?.currency ?? "ZAR"} / época alta
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                      <span>{casa.capacity} hósp.</span>
                      <span>·</span>
                      <span>{casa.bedroom} quarto{casa.bedroom !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="col-span-full text-center py-16 text-gray-400 text-sm">
                  Nenhuma casa encontrada.
                </div>
              )}
            </div>

            {/* Paginação também em baixo (conveniência) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white">
                  <ChevronLeft size={15} />
                </button>
                {getPageNumbers().map((page) => (
                  <button key={page} onClick={() => goToPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition border ${
                      page === currentPage
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}>
                    {page}
                  </button>
                ))}
                <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition disabled:opacity-30 disabled:cursor-not-allowed bg-white">
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">{editingId ? "Editar Casa" : "Adicionar Nova Casa"}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700 transition"><X size={20} /></button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">

              {/* Localização */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Praia / Localização *</label>
                <p className="text-xs text-gray-400 mb-2">Seleciona uma praia existente <strong>ou</strong> escreve o nome de uma nova.</p>
                <select
                  value={novaPraia ? "" : form.location}
                  onChange={(e) => { setForm((p) => ({ ...p, location: e.target.value })); setNovaPraia(""); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white mb-2"
                >
                  <option value="">Selecionar praia existente</option>
                  {praias.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  value={novaPraia}
                  onChange={(e) => { setNovaPraia(e.target.value); setForm((p) => ({ ...p, location: "" })); }}
                  placeholder="Ou escreve nova praia ex: Pemba"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Descrição</label>
                <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descreve a casa, ambiente, proximidade ao mar..." rows={4}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              {/* Preços */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preço por noite *</label>
                <p className="text-xs text-gray-400 mb-2">Preços na moeda base. A conversão é feita automaticamente no site.</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Época baixa *</p>
                    <input type="number" min={0} value={form.price.low_season} required
                      onChange={(e) => setForm((p) => ({ ...p, price: { ...p.price, low_season: e.target.value } }))}
                      placeholder="ex: 3000"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Época alta *</p>
                    <input type="number" min={0} value={form.price.high_season} required
                      onChange={(e) => setForm((p) => ({ ...p, price: { ...p.price, high_season: e.target.value } }))}
                      placeholder="ex: 5000"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Moeda</p>
                    <select value={form.price.currency}
                      onChange={(e) => setForm((p) => ({ ...p, price: { ...p.price, currency: e.target.value } }))}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                    >
                      <option value="ZAR">ZAR</option>
                      <option value="MZN">MZN</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Quartos + Capacidade + Rating */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quartos</label>
                  <input type="number" min={1} max={20} value={form.bedroom}
                    onChange={(e) => setForm((p) => ({ ...p, bedroom: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Capacidade</label>
                  <input type="number" min={1} max={30} value={form.capacity}
                    onChange={(e) => setForm((p) => ({ ...p, capacity: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Rating</label>
                  <input type="number" min={1} max={5} step={0.1} value={form.rating}
                    onChange={(e) => setForm((p) => ({ ...p, rating: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Coordenadas GPS */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                  <MapPin size={12} /> Coordenadas GPS
                </label>
                <p className="text-xs text-gray-400 mb-2">Google Maps → clique direito → "O que há aqui?" → copiar lat/lng. Deixa vazio se não tiver.</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="any" value={form.coordinates.lat}
                    onChange={(e) => setForm((p) => ({ ...p, coordinates: { ...p.coordinates, lat: e.target.value } }))}
                    placeholder="Latitude ex: -26.8451"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                  <input type="number" step="any" value={form.coordinates.lng}
                    onChange={(e) => setForm((p) => ({ ...p, coordinates: { ...p.coordinates, lng: e.target.value } }))}
                    placeholder="Longitude ex: 32.8898"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Comodidades */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Comodidades</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {AMENITY_ICONS.map((a) => {
                    const selected = form.amenities.find((x) => x.name === a.name);
                    return (
                      <button key={a.name} type="button" onClick={() => toggleAmenity(a)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all ${
                          selected ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300"
                        }`}>
                        <img src={a.icon} alt={a.name} className={`w-4 h-4 ${selected ? "brightness-200" : ""}`} onError={(e) => (e.target.style.display = "none")} />
                        {a.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* URLs das imagens */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">URLs das imagens</label>
                <p className="text-xs text-gray-400 mb-2">Uma URL por linha.</p>
                <textarea
                  value={form.images.join("\n")}
                  onChange={(e) => setForm((p) => ({ ...p, images: e.target.value.split("\n").filter(Boolean) }))}
                  placeholder={"https://...\nhttps://..."}
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white resize-none font-mono"
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : editingId ? "Guardar alterações" : "Adicionar casa"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmação de eliminação */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Eliminar casa?</h3>
            <p className="text-sm text-gray-500">Esta ação é permanente e não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 font-semibold text-sm hover:bg-gray-50 transition">Cancelar</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCasas;