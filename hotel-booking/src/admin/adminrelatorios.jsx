// src/admin/AdminRelatorios.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { TrendingUp } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
} from "recharts";

const COLORS = ["#2563eb","#60a5fa","#93c5fd","#bfdbfe","#dbeafe","#1d4ed8"];

const AdminRelatorios = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState("6m");

  useEffect(() => { loadRelatorios(); }, [periodo]);

  const loadRelatorios = async () => {
    setLoading(true);
    try {
      // BACKEND: GET /api/admin/reports?periodo=6m
      // Deve incluir porPais: [{ pais, total, percentagem }]
      const res = await api.get("/admin/reports", { params: { periodo } });
      setData(res.data?.data ?? res.data);
    } catch {
      setData({
        receitaMensal: [
          { mes: "Mar", receita: 12000, reservas: 14 },
          { mes: "Abr", receita: 18500, reservas: 22 },
          { mes: "Mai", receita: 24000, reservas: 31 },
          { mes: "Jun", receita: 31000, reservas: 38 },
          { mes: "Jul", receita: 42800, reservas: 52 },
          { mes: "Ago", receita: 38200, reservas: 47 },
        ],
        porPraia: [
          { name: "Ponta de Ouro", value: 42 },
          { name: "Praia do Tofo", value: 28 },
          { name: "Bilene",        value: 15 },
          { name: "Malongane",     value: 9  },
          { name: "Mamoli",        value: 6  },
        ],
        // BACKEND: porPais vem do campo country do utilizador registado
        // endpoint deve agrupar reservas por user.country e contar
        porPais: [
          { pais: "Moçambique", flag: "🇲🇿", total: 89,  percentagem: 44 },
          { pais: "África do Sul", flag: "🇿🇦", total: 61, percentagem: 30 },
          { pais: "Portugal",   flag: "🇵🇹", total: 28,  percentagem: 14 },
          { pais: "Brasil",     flag: "🇧🇷", total: 14,  percentagem: 7  },
          { pais: "Reino Unido",flag: "🇬🇧", total: 8,   percentagem: 4  },
          { pais: "Outros",     flag: "🌍", total: 4,   percentagem: 2  },
        ],
        topCasas: [
          { name: "Casa do Mar",      receita: 18000, reservas: 22 },
          { name: "Villa Sunset",     receita: 14500, reservas: 17 },
          { name: "Palhota Tofo",     receita: 11200, reservas: 14 },
          { name: "Casa Bilene",      receita: 8900,  reservas: 11 },
          { name: "Cabana Malongane", receita: 6200,  reservas: 8  },
        ],
        resumo: {
          receitaTotal:    "128.700 MZN",
          reservasTotais:  204,
          taxaOcupacao:    "68%",
          ticketMedio:     "631 MZN",
        },
      });
    } finally {
      setLoading(false);
    }
  };

  const SummaryCard = ({ label, value }) => (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
          <TrendingUp size={14} className="text-blue-600" />
        </div>
        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-xl font-bold text-gray-900">{value}</p>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header + período */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Relatórios de Receita</h2>
            <p className="text-sm text-gray-500 mt-0.5">Análise financeira da plataforma.</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {["3m","6m","12m"].map((p) => (
              <button key={p} onClick={() => setPeriodo(p)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  periodo === p ? "bg-blue-600 text-white shadow-sm" : "bg-white border border-gray-200 text-gray-600"
                }`}
              >
                {p === "3m" ? "3 meses" : p === "6m" ? "6 meses" : "12 meses"}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* Resumo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard label="Receita total"  value={data.resumo.receitaTotal}   />
              <SummaryCard label="Reservas"        value={data.resumo.reservasTotais} />
              <SummaryCard label="Taxa ocupação"   value={data.resumo.taxaOcupacao}   />
              <SummaryCard label="Ticket médio"    value={data.resumo.ticketMedio}    />
            </div>

            {/* Gráfico linha — receita */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Evolução da Receita (MZN)</h3>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={data.receitaMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={35} />
                  <Tooltip
                    contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "11px" }}
                    formatter={(v) => [`${v.toLocaleString()} MZN`, "Receita"]}
                  />
                  <Line type="monotone" dataKey="receita" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3, fill: "#2563eb" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Barras + Pie por praia */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Reservas por mês</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={data.receitaMensal}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                    <Tooltip contentStyle={{ borderRadius: "10px", border: "1px solid #e5e7eb", fontSize: "11px" }} />
                    <Bar dataKey="reservas" fill="#2563eb" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <h3 className="text-sm font-semibold text-gray-800 mb-4">Reservas por praia (%)</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.porPraia} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value">
                      {data.porPraia.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => [`${v}%`, "Reservas"]} contentStyle={{ fontSize: "11px", borderRadius: "8px" }} />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Países dos hóspedes ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Países dos hóspedes</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Com base no país registado na conta de cada utilizador
                  </p>
                </div>
                <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 px-2 py-1 rounded-lg">
                  {data.porPais.reduce((acc, p) => acc + p.total, 0)} reservas
                </span>
              </div>

              <div className="p-4 space-y-3">
                {data.porPais.map((item, i) => (
                  <div key={item.pais} className="flex items-center gap-3">
                    {/* Posição + bandeira */}
                    <div className="flex items-center gap-2 w-36 sm:w-44 shrink-0">
                      <span className="text-xs text-gray-400 w-4 text-right">{i + 1}</span>
                      <span className="text-lg leading-none">{item.flag}</span>
                      <span className="text-sm font-medium text-gray-700 truncate">{item.pais}</span>
                    </div>

                    {/* Barra de progresso */}
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full transition-all duration-500"
                        style={{
                          width: `${item.percentagem}%`,
                          background: COLORS[i % COLORS.length],
                        }}
                      />
                    </div>

                    {/* Percentagem + total */}
                    <div className="flex items-center gap-2 shrink-0 text-right">
                      <span className="text-sm font-bold text-gray-800">{item.percentagem}%</span>
                      <span className="text-xs text-gray-400 hidden sm:block">({item.total})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top casas */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-800">Top 5 Casas por Receita</h3>
              </div>

              {/* Cards mobile */}
              <div className="md:hidden divide-y divide-gray-50">
                {data.topCasas.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3 px-4 py-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                      i === 0 ? "bg-yellow-100 text-yellow-700" :
                      i === 1 ? "bg-gray-100 text-gray-600" :
                      i === 2 ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-500"
                    }`}>{i+1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.reservas} reservas</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 shrink-0">{c.receita.toLocaleString()} MZN</span>
                  </div>
                ))}
              </div>

              {/* Tabela desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                      <th className="text-left px-5 py-3">#</th>
                      <th className="text-left px-5 py-3">Casa</th>
                      <th className="text-left px-5 py-3">Reservas</th>
                      <th className="text-left px-5 py-3">Receita</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.topCasas.map((c, i) => (
                      <tr key={c.name} className="hover:bg-gray-50/60 transition">
                        <td className="px-5 py-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            i === 0 ? "bg-yellow-100 text-yellow-700" :
                            i === 1 ? "bg-gray-100 text-gray-600" :
                            i === 2 ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-500"
                          }`}>{i+1}</span>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{c.name}</td>
                        <td className="px-5 py-3 text-gray-600">{c.reservas}</td>
                        <td className="px-5 py-3 font-semibold text-blue-600">{c.receita.toLocaleString()} MZN</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRelatorios;