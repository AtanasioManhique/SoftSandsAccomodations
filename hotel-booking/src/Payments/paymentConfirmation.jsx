// pages/PaymentConfirmation.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function PaymentConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();

  const data = location.state;

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-red-600 font-semibold text-lg">
          Nenhuma informação de pagamento encontrada.
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
        >
          Voltar ao início
        </button>
      </div>
    );
  }

  const formattedDate = new Date(data.paidAt).toLocaleString("pt-PT", {
    dateStyle: "long",
    timeStyle: "short",
  });

  return (
    <div className="bg-gray-50 py-10 px-4 pt-24">
      <div className="bg-white rounded-2xl shadow-md border max-w-sm w-full mx-auto p-6 text-center space-y-4">

        {/* Ícone de sucesso */}
        <div className="flex justify-center pt-1">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-bold text-gray-900">Valor reservado!</h1>
          <p className="text-gray-500 text-xs mt-1">
            O pedido de reserva foi submetido com sucesso.
          </p>
        </div>

        {/* Banner informativo de pré-autorização */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-left space-y-1">
          <p className="text-xs font-semibold text-blue-800">💳 Pré-autorização realizada</p>
          <p className="text-xs text-blue-700 leading-relaxed">
            O valor de <strong>{data.totalPrice}</strong> foi <strong>reservado</strong> no seu método de pagamento mas <strong>não foi debitado</strong>. O débito ocorrerá apenas após a confirmação pelo administrador.
          </p>
        </div>

        {/* Banner pendente */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-left space-y-1">
          <p className="text-xs font-semibold text-yellow-800">⏳ Aguarda confirmação</p>
          <p className="text-xs text-yellow-700 leading-relaxed">
            A sua reserva está <strong>pendente</strong>. Será notificado assim que o administrador confirmar. Pode acompanhar o estado em <strong>Minhas Reservas</strong>.
          </p>
          {/*
            BACKEND: Quando integrado, esta notificação será enviada
            por email/push notification automática ao utilizador.
          */}
        </div>

        {/* Detalhes */}
        <div className="bg-gray-50 rounded-xl p-3 text-left space-y-2 text-sm border">
          <Row label="Referência" value={data.transactionId} small />
          <Row label="Método"     value={data.method} />
          <Row label="Entrada"    value={data.startDate} />
          <Row label="Saída"      value={data.endDate} />
          <Row label="Hóspedes"   value={data.guests} />
          <Row label="Total"      value={data.totalPrice} bold />
          <Row label="Data"       value={formattedDate} />
        </div>

        <p className="text-xs text-gray-400 leading-relaxed">
          Simulação de pré-autorização. Em produção o valor será
          gerido pelo PaySuite em tempo real.
        </p>

        {/* Botões */}
        <button
          onClick={() => navigate("/minhasreservas")}
          className="w-full py-2.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition text-sm"
        >
          Ver Minhas Reservas
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full py-2.5 border-2 border-gray-200 hover:border-gray-400 rounded-xl font-semibold text-gray-700 transition text-sm"
        >
          Voltar ao início
        </button>

      </div>
    </div>
  );
}

function Row({ label, value, bold = false, small = false }) {
  return (
    <div className="flex justify-between items-start gap-2">
      <span className="text-gray-500 shrink-0">{label}</span>
      <span className={`text-gray-800 text-right break-all ${bold ? "font-bold" : "font-medium"} ${small ? "text-xs" : ""}`}>
        {value}
      </span>
    </div>
  );
}