// src/admin/AdminCalendario.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";

const MONTHS   = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
const WEEKDAYS = ["D","S","T","Q","Q","S","S"];

const AdminCalendario = () => {
  const [year, setYear]               = useState(new Date().getFullYear());
  const [month, setMonth]             = useState(new Date().getMonth());
  const [casas, setCasas]             = useState([]);
  const [selectedCasa, setSelectedCasa] = useState(null);
  const [bookings, setBookings]       = useState([]);
  const [loading, setLoading]         = useState(false);
  const [showCasasList, setShowCasasList] = useState(false);

  useEffect(() => { loadCasas(); }, []);
  useEffect(() => { if (selectedCasa) loadBookings(selectedCasa); }, [selectedCasa, month, year]);

  const loadCasas = async () => {
    try {
      const res = await api.get("/admin/accommodations");
      const data = res.data?.data ?? res.data ?? [];
      setCasas(Array.isArray(data) ? data : []);
      if (data?.[0]) setSelectedCasa(data[0].id);
    } catch {
      const mock = [
        { id: 1, location: "Ponta de Ouro" },
        { id: 2, location: "Praia do Tofo" },
        { id: 3, location: "Bilene"        },
      ];
      setCasas(mock);
      setSelectedCasa(mock[0].id);
    }
  };

  const loadBookings = async (casaId) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/accommodations/${casaId}/bookings`, { params: { month: month + 1, year } });
      setBookings(res.data?.data ?? res.data ?? []);
    } catch {
      setBookings([
        { id: "b1", guestName: "Ana Silva",   startDate: new Date(year, month, 3).toISOString().split("T")[0],  endDate: new Date(year, month, 7).toISOString().split("T")[0],  status: "confirmado" },
        { id: "b2", guestName: "João Matos",  startDate: new Date(year, month, 12).toISOString().split("T")[0], endDate: new Date(year, month, 16).toISOString().split("T")[0], status: "pendente"   },
        { id: "b3", guestName: "Maria Costa", startDate: new Date(year, month, 20).toISOString().split("T")[0], endDate: new Date(year, month, 25).toISOString().split("T")[0], status: "confirmado" },
      ]);
    } finally { setLoading(false); }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear((y) => y - 1); } else setMonth((m) => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear((y) => y + 1); } else setMonth((m) => m + 1); };

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells       = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const getDayStatus = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    for (const b of bookings) {
      if (dateStr >= b.startDate && dateStr < b.endDate) return b.status === "confirmado" ? "occupied" : "pending";
    }
    return "free";
  };

  const getBookingForDay = (day) => {
    if (!day) return null;
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return bookings.find((b) => dateStr >= b.startDate && dateStr < b.endDate) ?? null;
  };

  const statusStyle = {
    free:     "bg-white border-gray-100 text-gray-700",
    occupied: "bg-green-50 border-green-200 text-green-800",
    pending:  "bg-yellow-50 border-yellow-200 text-yellow-800",
  };

  const today   = new Date();
  const isToday = (day) => day && today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
  const casaAtual = casas.find((c) => c.id === selectedCasa);

  return (
    <AdminLayout>
      <div className="space-y-4">

        <div>
          <h2 className="text-lg font-bold text-gray-900">Calendário de Ocupação</h2>
          <p className="text-sm text-gray-500 mt-0.5">Visualize as reservas por casa e mês.</p>
        </div>

        {/* Selector de casa mobile — dropdown */}
        <div className="md:hidden">
          <button
            onClick={() => setShowCasasList(!showCasasList)}
            className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700"
          >
            <div className="flex items-center gap-2 min-w-0">
              <MapPin size={15} className="text-blue-600 shrink-0" />
              <span className="truncate">{casaAtual?.location ?? "Selecionar casa"}</span>
            </div>
            <ChevronRight size={16} className={`text-gray-400 transition-transform ${showCasasList ? "rotate-90" : ""}`} />
          </button>
          {showCasasList && (
            <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
              {casas.map((c) => (
                <button key={c.id} onClick={() => { setSelectedCasa(c.id); setShowCasasList(false); }}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-gray-50 last:border-0 flex items-center gap-2 ${selectedCasa === c.id ? "bg-blue-50 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <MapPin size={13} /> {c.location}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">

          {/* Sidebar Desktop */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Casas</h3>
            <div className="space-y-1.5">
              {casas.map((c) => (
                <button key={c.id} onClick={() => setSelectedCasa(c.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-all ${selectedCasa === c.id ? "bg-blue-600 text-white shadow-sm" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  <p className="font-medium leading-none truncate">{c.location}</p>
                </button>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Legenda</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-300 shrink-0" /> Reservado
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded bg-yellow-100 border border-yellow-300 shrink-0" /> Pendente
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <div className="w-4 h-4 rounded bg-white border border-gray-200 shrink-0" /> Disponível
              </div>
            </div>
          </div>

          {/* Calendário */}
          <div className="md:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4">

            {/* Nav mês */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <div className="text-center">
                <h3 className="text-sm font-bold text-gray-900">{MONTHS[month]} {year}</h3>
                {casaAtual && <p className="text-xs text-blue-600 mt-0.5 truncate">{casaAtual.location}</p>}
              </div>
              <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 transition">
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Legenda mobile */}
            <div className="flex items-center gap-3 mb-3 md:hidden">
              <div className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 rounded bg-green-100 border border-green-300" /> Reservado</div>
              <div className="flex items-center gap-1 text-xs text-gray-500"><div className="w-3 h-3 rounded bg-yellow-100 border border-yellow-300" /> Pendente</div>
            </div>

            {/* Cabeçalho dias */}
            <div className="grid grid-cols-7 mb-1">
              {WEEKDAYS.map((d, i) => (
                <div key={i} className="text-center text-xs font-semibold text-gray-400 py-1">{d}</div>
              ))}
            </div>

            {/* Grid dias */}
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-7 gap-0.5 sm:gap-1">
                {cells.map((day, i) => {
                  const status  = getDayStatus(day);
                  const booking = getBookingForDay(day);
                  return (
                    <div key={i}
                      title={booking ? `${booking.guestName} (${booking.status})` : ""}
                      className={`relative aspect-square flex flex-col items-center justify-center rounded-lg border text-xs transition-all cursor-default
                        ${!day ? "border-transparent" : statusStyle[status]}
                        ${isToday(day) ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                      `}
                    >
                      {day && (
                        <span className={`font-semibold leading-none text-xs ${isToday(day) ? "text-blue-600" : ""}`}>
                          {day}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Lista de reservas do mês */}
            {bookings.length > 0 && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Reservas em {MONTHS[month]}</h4>
                <div className="space-y-2">
                  {bookings.map((b) => (
                    <div key={b.id} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{b.guestName}</p>
                        <p className="text-xs text-gray-500">{b.startDate} → {b.endDate}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2 ${b.status === "confirmado" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {b.status === "confirmado" ? "Confirmado" : "Pendente"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCalendario;