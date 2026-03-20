// src/admin/AdminPraias.jsx
import React, { useEffect, useState } from "react";
import AdminLayout from "./adminlayout";
import { api } from "../services/api";
import { MapPin, Home, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

const AdminPraias = () => {
  const [praias, setPraias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPraias(); }, []);

  const loadPraias = async () => {
    try {
      const res = await api.get("/admin/accommodations");
      const data = res.data?.data ?? res.data ?? [];
      buildPraias(Array.isArray(data) ? data : []);
    } catch {
      try {
        const res = await fetch("/data/casas.json");
        const data = await res.json();
        // 🚧 DEV — inclui casas do localStorage
        const DEV_KEY = "dev_casas_admin";
        let devCasas = [];
        try { devCasas = JSON.parse(localStorage.getItem(DEV_KEY)) || []; } catch {}
        buildPraias([...data, ...devCasas]);
        // 🚧 fim DEV
      } catch (err) { console.error(err); }
    } finally { setLoading(false); }
  };

  const buildPraias = (casas) => {
    const map = {};
    casas.forEach((casa) => {
      if (!casa.location) return;
      if (!map[casa.location]) map[casa.location] = { name: casa.location, total: 0, imagem: null };
      map[casa.location].total += 1;
      if (!map[casa.location].imagem && casa.image?.[0]) map[casa.location].imagem = casa.image[0];
    });
    setPraias(Object.values(map));
  };

  return (
    <AdminLayout>
      <div className="space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Praias</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Praias existentes com base nas casas cadastradas. Para adicionar uma nova praia, adiciona uma casa com um novo location em{" "}
              <Link to="/admin/casas" className="text-blue-600 hover:underline font-medium">Gestão de Casas</Link>.
            </p>
          </div>
          <Link
            to="/admin/casas"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm self-start shrink-0"
          >
            <Home size={16} /> Gerir Casas
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-7 h-7 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : praias.length === 0 ? (
          <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            Nenhuma praia encontrada. Adiciona casas para as praias aparecerem aqui.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {praias.map((praia) => (
              <div key={praia.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="h-28 sm:h-32 bg-gradient-to-br from-blue-100 to-blue-200 relative">
                  {praia.imagem ? (
                    <img src={praia.imagem} alt={praia.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">🏖️</div>
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                    <MapPin size={13} className="text-white" />
                    <span className="text-white font-semibold text-sm drop-shadow">{praia.name}</span>
                  </div>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Home size={14} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{praia.total}</p>
                      <p className="text-xs text-gray-400">casa{praia.total !== 1 ? "s" : ""}</p>
                    </div>
                  </div>
                  <Link to="/admin/casas" className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
                    Ver casas <ChevronRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Nota informativa */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-700">
          <strong>Como funciona:</strong> cada casa tem um campo "location". O site agrupa automaticamente as casas por location e mostra uma secção por praia. Para criar uma nova praia, adiciona uma casa com um novo location.
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPraias;