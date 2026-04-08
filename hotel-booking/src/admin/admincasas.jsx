// src/admin/AdminCasas.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { Plus, Pencil, Trash2, X, MapPin, Search } from "lucide-react";
import { formatCurrency } from "../context/utils/currency";

const AMENITIES_LIST = [
  "Wi-Fi",
  "Piscina Privada",
  "Estacionamento",
  "Cozinha Equipada",
  "Ar-Condicionado",
  "Ventilação",
  "Área de Churrasco",
  "Vista ao Mar",
  "Sala Mobilada",
  "Serviços de Limpeza",
];

const AMENITY_ICONS = {
  "Wi-Fi":               "/icons/wi-fi.png",
  "Piscina Privada":     "/icons/swimming.png",
  "Estacionamento":      "/icons/car.png",
  "Cozinha Equipada":    "/icons/kitchen.png",
  "Ar-Condicionado":     "/icons/air-conditioner.png",
  "Ventilação":          "/icons/fan.png",
  "Área de Churrasco":   "/icons/barbecue.png",
  "Vista ao Mar":        "/icons/sunset.png",
  "Sala Mobilada":       "/icons/sofa.png",
  "Serviços de Limpeza": "/icons/clean.png",
};

const emptyForm = {
  name:            "",
  description:     "",
  location:        "",
  beachName:       "",
  pricePerNight:   "",
  lowSeasonPrice:  "",
  highSeasonPrice: "",
  peakSeasonPrice: "",
  maxGuests:       2,
  bedrooms:        1,
  bathrooms:       1,
  latitude:        "",
  longitude:       "",
  amenities:       [],
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
  const [imagesToUpload, setImagesToUpload]   = useState([]);
  const [existingImages, setExistingImages]   = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [isDragging, setIsDragging]           = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/accommodations");
      const data = res.data?.data ?? res.data ?? [];
      const todas = Array.isArray(data) ? data : [];
      setCasas(todas);
      setPraias([...new Set(todas.map((c) => c.location).filter(Boolean))]);
    } catch (err) {
      console.error("Erro ao carregar casas:", err);
    } finally {
      setLoading(false);
    }
  };

  const openNew = () => {
    setForm(emptyForm);
    setNovaPraia("");
    setEditingId(null);
    setImagesToUpload([]);
    setExistingImages([]);
    setShowForm(true);
  };

  const openEdit = (casa) => {
    setForm({
      name:           casa.name           ?? "",
      description:    casa.description    ?? "",
      location:       casa.location       ?? "",
      beachName:      casa.beach_name ?? casa.beachName ?? "",
      pricePerNight:  casa.price_per_night ?? casa.pricePerNight ?? "",
      lowSeasonPrice: casa.low_season_price ?? casa.lowSeasonPrice ?? "",
      highSeasonPrice:casa.high_season_price ?? casa.highSeasonPrice ?? "",
      peakSeasonPrice:casa.peak_season_price ?? casa.peakSeasonPrice ?? "",
      maxGuests:      casa.max_guests ?? casa.maxGuests ?? 2,
      bedrooms:       casa.bedrooms       ?? 1,
      bathrooms:      casa.bathrooms      ?? 1,
      latitude:       casa.latitude       ?? "",
      longitude:      casa.longitude      ?? "",
      amenities:      casa.amenities      ?? [],
    });
    setNovaPraia("");
    setEditingId(casa.id);
    setImagesToUpload([]);
    setExistingImages(casa.images ?? []);
    setShowForm(true);
  };

  const handleImageUpload = async (accommodationId) => {
    if (imagesToUpload.length === 0) return;
    setUploadingImages(true);

    try {
      const formData = new FormData();
      imagesToUpload.forEach((file) => formData.append("images", file));

      await api.post(`/accommodations/${accommodationId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setImagesToUpload([]);
      await loadData();
    } catch (err) {
      console.error("Erro ao carregar imagens:", err);
      alert("Casa guardada, mas erro ao carregar imagens. Edita a casa para tentar novamente.");
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!editingId) return;
    try {
      await api.delete(`/accommodations/${editingId}/images/${imageId}`);
      setExistingImages((prev) => prev.filter((img) => img.id !== imageId));
      await loadData();
    } catch (err) {
      console.error("Erro ao eliminar imagem:", err);
      alert("Erro ao eliminar imagem.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const locationFinal = novaPraia.trim() || form.location;
    if (!locationFinal)     { alert("Seleciona uma praia ou escreve o nome de uma nova."); return; }
    if (!form.name.trim())  { alert("O nome da casa é obrigatório."); return; }
    if (!form.pricePerNight){ alert("O preço por noite é obrigatório."); return; }

    setSaving(true);

    const payload = {
      name:           form.name.trim(),
      description:    form.description.trim(),
      location:       locationFinal,
      beachName:      form.beachName.trim() || null,
      pricePerNight:  Number(form.pricePerNight),
      maxGuests:      Number(form.maxGuests),
      bedrooms:       Number(form.bedrooms),
      bathrooms:      Number(form.bathrooms),
      latitude:       form.latitude  ? Number(form.latitude)  : null,
      longitude:      form.longitude ? Number(form.longitude) : null,
      amenities:      form.amenities,
      lowSeasonPrice: form.lowSeasonPrice  ? Number(form.lowSeasonPrice)  : null,
      highSeasonPrice:form.highSeasonPrice ? Number(form.highSeasonPrice) : null,
      peakSeasonPrice:form.peakSeasonPrice ? Number(form.peakSeasonPrice) : null,
    };

    try {
      let savedId = editingId;

      if (editingId) {
        const res = await api.put(`/accommodations/${editingId}`, payload);
        const updated = res.data?.data?.accommodation ?? { ...payload, id: editingId };
        setCasas((prev) => prev.map((c) => c.id === editingId ? updated : c));
      } else {
        const res = await api.post("/accommodations", payload);
        const nova = res.data?.data?.accommodation ?? res.data?.data ?? res.data;
        savedId = nova.id;
        setCasas((prev) => [...prev, nova]);
        if (!praias.includes(locationFinal)) setPraias((prev) => [...prev, locationFinal]);
      }

      if (imagesToUpload.length > 0 && savedId) {
        await handleImageUpload(savedId);
      }

      setShowForm(false);
    } catch (err) {
      console.error("Erro ao guardar casa:", err);
      const details = err.response?.data?.error?.details;
      if (details) {
        const msgs = details.map((d) => `${d.field}: ${d.message}`).join("\n");
        alert(`Erro de validação:\n${msgs}`);
      } else {
        alert("Erro ao guardar. Tenta novamente.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/accommodations/${id}`);
      setCasas((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Erro ao eliminar casa:", err);
      alert("Erro ao eliminar. Tenta novamente.");
    } finally {
      setDeleteConfirm(null);
    }
  };

  const toggleAmenity = (name) => {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(name)
        ? prev.amenities.filter((a) => a !== name)
        : [...prev.amenities, name],
    }));
  };

  const filtered = casas.filter(
    (c) => !search || c.location?.toLowerCase().includes(search.toLowerCase())
  );

  const getPrice = (casa) => casa.price_per_night ?? casa.pricePerNight;
  const getGuests = (casa) => casa.max_guests ?? casa.maxGuests;
  const getImage = (casa) => casa.images?.[0]?.url ?? casa.image?.[0];

  return (
    <AdminLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gestão de Casas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Casas criadas aqui aparecem automaticamente no explorar.</p>
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Pesquisar por praia..."
                className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-400 w-52 bg-white"
              />
            </div>
            <button onClick={openNew} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm">
              <Plus size={16} /> Nova Casa
            </button>
          </div>
        </div>

        {/* Grid de casas */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((casa) => (
              <div key={casa.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-36 bg-gray-100 flex items-center justify-center relative">
                  {getImage(casa) ? (
                    <img src={getImage(casa)} alt={casa.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-gray-300">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 3l9 7.5V21a1 1 0 01-1 1H5a1 1 0 01-1-1V10.5z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 21V12h6v9" />
                      </svg>
                      <span className="text-xs text-gray-300">Sem imagem</span>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1.5">
                    <button onClick={() => openEdit(casa)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow-sm">
                      <Pencil size={13} className="text-blue-600" />
                    </button>
                    <button onClick={() => setDeleteConfirm(casa.id)} className="p-1.5 bg-white/90 rounded-lg hover:bg-white transition shadow-sm">
                      <Trash2 size={13} className="text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-sm font-semibold text-gray-900 truncate">{casa.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                    <MapPin size={11} /> {casa.location}
                  </div>
                  <div className="flex flex-col gap-0.5 mt-2">
                    <span className="text-blue-600 font-bold text-sm">
                      {formatCurrency(getPrice(casa))} / noite
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                    <span>{getGuests(casa)} hósp.</span>
                    <span>·</span>
                    <span>{casa.bedrooms} quarto{casa.bedrooms !== 1 ? "s" : ""}</span>
                    <span>·</span>
                    <span>{casa.bathrooms} wc</span>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-gray-400 text-sm">Nenhuma casa encontrada.</div>
            )}
          </div>
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

              {/* Nome */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome da casa *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="ex: Casa do Mar, Villa Sunset"
                  required
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Localização */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Localização *</label>
                <p className="text-xs text-gray-400 mb-2">Seleciona existente <strong>ou</strong> escreve nova.</p>
                <select
                  value={novaPraia ? "" : form.location}
                  onChange={(e) => { setForm((p) => ({ ...p, location: e.target.value })); setNovaPraia(""); }}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white mb-2"
                >
                  <option value="">Selecionar existente</option>
                  {praias.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <input
                  value={novaPraia}
                  onChange={(e) => { setNovaPraia(e.target.value); setForm((p) => ({ ...p, location: "" })); }}
                  placeholder="Ou escreve nova localização ex: Macaneta"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Nome da praia */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Nome da praia</label>
                <input
                  value={form.beachName}
                  onChange={(e) => setForm((p) => ({ ...p, beachName: e.target.value }))}
                  placeholder="ex: Praia do Tofo, Praia da Barra"
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Descreve a casa, ambiente, proximidade ao mar..."
                  rows={4}
                  required
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white resize-none"
                />
              </div>

              {/* Preços */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Preços (ZAR)</label>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">Define o preço base e os preços sazonais opcionais.</p>

                {/* Preço base — destaque */}
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1 font-medium">Preço base por noite *</p>
                  <input
                    type="number" min={0} value={form.pricePerNight}
                    onChange={(e) => setForm((p) => ({ ...p, pricePerNight: e.target.value }))}
                    placeholder="ex: 3000"
                    required
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>

                {/* 3 épocas em grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-blue-600 mb-1">Época baixa</p>
                    <input
                      type="number" min={0} value={form.lowSeasonPrice}
                      onChange={(e) => setForm((p) => ({ ...p, lowSeasonPrice: e.target.value }))}
                      placeholder="ex: 2500"
                      className="w-full border border-blue-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-300 bg-white"
                    />
                  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-orange-500 mb-1">Época alta</p>
                    <input
                      type="number" min={0} value={form.highSeasonPrice}
                      onChange={(e) => setForm((p) => ({ ...p, highSeasonPrice: e.target.value }))}
                      placeholder="ex: 5000"
                      className="w-full border border-orange-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-300 bg-white"
                    />
                  </div>
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                    <p className="text-xs font-semibold text-red-500 mb-1">Época de pico</p>
                    <input
                      type="number" min={0} value={form.peakSeasonPrice}
                      onChange={(e) => setForm((p) => ({ ...p, peakSeasonPrice: e.target.value }))}
                      placeholder="ex: 8000"
                      className="w-full border border-red-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-red-300 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Quartos + WC + Capacidade */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Quartos</label>
                  <input type="number" min={0} max={20} value={form.bedrooms}
                    onChange={(e) => setForm((p) => ({ ...p, bedrooms: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Casas de banho</label>
                  <input type="number" min={0} max={20} value={form.bathrooms}
                    onChange={(e) => setForm((p) => ({ ...p, bathrooms: e.target.value }))}
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Hóspedes *</label>
                  <input type="number" min={1} max={30} value={form.maxGuests}
                    onChange={(e) => setForm((p) => ({ ...p, maxGuests: e.target.value }))}
                    required
                    className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Coordenadas GPS */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1">
                  <MapPin size={12} /> Coordenadas GPS
                </label>
                <p className="text-xs text-gray-400 mb-2">Google Maps → clique direito → copiar lat/lng.</p>
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" step="any" value={form.latitude}
                    onChange={(e) => setForm((p) => ({ ...p, latitude: e.target.value }))}
                    placeholder="Latitude ex: -23.8541"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                  <input type="number" step="any" value={form.longitude}
                    onChange={(e) => setForm((p) => ({ ...p, longitude: e.target.value }))}
                    placeholder="Longitude ex: 35.3833"
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-400 bg-gray-50 focus:bg-white"
                  />
                </div>
              </div>

              {/* Comodidades */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Comodidades</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                  {AMENITIES_LIST.map((name) => {
                    const selected = form.amenities.includes(name);
                    return (
                      <button key={name} type="button" onClick={() => toggleAmenity(name)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border transition-all ${selected ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300"}`}
                      >
                        <img src={AMENITY_ICONS[name]} alt={name} className={`w-4 h-4 ${selected ? "brightness-200" : ""}`} onError={(e) => (e.target.style.display = "none")} />
                        {name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Imagens existentes (modo edição) */}
              {editingId && existingImages.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Imagens actuais</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {existingImages.map((img) => (
                      <div key={img.id} className="relative group">
                        <img
                          src={img.url}
                          alt="Casa"
                          className={`w-full h-20 object-cover rounded-lg ${img.is_primary ? "ring-2 ring-blue-500" : ""}`}
                        />
                        {img.is_primary && (
                          <span className="absolute top-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full">Principal</span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(img.id)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload novas imagens — drag & drop */}
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {editingId ? "Adicionar imagens" : "Imagens"}
                </label>
                <p className="text-xs text-gray-400 mt-0.5 mb-3">Máximo 5 imagens, 5MB cada. Formatos: JPG, PNG, WebP.</p>

                {/* Grelha de previews + botão de adicionar */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {imagesToUpload.map((file, i) => (
                    <div key={i} className="relative group aspect-square">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${i}`}
                        className="w-full h-full object-cover rounded-xl border border-gray-100"
                      />
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 bg-blue-600 text-white text-[9px] px-1.5 py-0.5 rounded-full leading-none">
                          Principal
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => setImagesToUpload((prev) => prev.filter((_, idx) => idx !== i))}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow transition opacity-0 group-hover:opacity-100"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}

                  {/* Botão de adicionar — visível se ainda há espaço */}
                  {imagesToUpload.length < 5 && (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const dropped = Array.from(e.dataTransfer.files)
                          .filter((f) => f.type.startsWith("image/"))
                          .slice(0, 5 - imagesToUpload.length);
                        setImagesToUpload((prev) => [...prev, ...dropped].slice(0, 5));
                      }}
                      onClick={() => document.getElementById("image-upload-input").click()}
                      className={`
                        aspect-square flex flex-col items-center justify-center gap-1
                        rounded-xl border-2 border-dashed cursor-pointer
                        transition-all duration-150 select-none
                        ${isDragging
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 bg-gray-100 hover:border-gray-300 hover:bg-gray-150"
                        }
                      `}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-[10px] text-gray-400 leading-tight text-center px-1">
                        Adicionar
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-xs text-gray-400 mt-2">
                  Arrasta imagens para a zona acima ou clica em "Adicionar". A primeira imagem será a principal.
                </p>

                <input
                  id="image-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files).slice(0, 5 - imagesToUpload.length);
                    setImagesToUpload((prev) => [...prev, ...files].slice(0, 5));
                  }}
                />
              </div>

              {/* Botões */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                  Cancelar
                </button>
                <button type="submit" disabled={saving || uploadingImages}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50 flex items-center justify-center gap-2">
                  {saving || uploadingImages ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {uploadingImages ? "A carregar imagens..." : "A guardar..."}
                    </>
                  ) : editingId ? "Guardar alterações" : "Adicionar casa"}
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