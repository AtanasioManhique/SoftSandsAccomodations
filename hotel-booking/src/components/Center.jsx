import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import {useTranslation} from "react-i18next"

const Center = () => {
  const [destinos, setDestinos] = useState([]);
  const [selectedDestino, setSelectedDestino] = useState("");
  const [activeField, setActiveField] = useState(null); // "start" | "end"

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const {t} = useTranslation();

  const datepickerRef = useRef(null);

  useEffect(() => {
    setDestinos([
      { id: 1, nome: "Ponta de Ouro" },
      { id: 2, nome: "Bilene" },
      { id: 3, nome: "Ponta Mamoli" },
      { id: 4, nome: "Praia do Tofo" },
      { id: 5, nome: "Ponta Malongane" },
      { id: 6, nome: "Ilha de Inhaca" },
    ]);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      destino: selectedDestino,
      entrada: startDate,
      saida: endDate,
    });
  };

  const openCalendar = (field) => {
    setActiveField(field);
    datepickerRef.current.setOpen(true);
  };

  return (
    <div className='flex flex-col items-start justify-center
      px-4 md:px-14 lg:px-22 xl:px-30 min-h-[90vh]
      bg-[url("/src/assets/backgroundimage.png")]
      bg-no-repeat bg-cover bg-center text-white pt-10 md:pt-0 -mb-9'
    >
      <h1 className='font-playfair text-3xl md:text-5xl font-bold max-w-xl mt-4'>
        {t("center.title")}
      </h1>

      <p className='max-w-130 mt-2 text-sm md:text-base'>
       {t("center.subtitle")}
      </p>

      {/* ==================== DESKTOP ==================== */}
      <form
        onSubmit={handleSubmit}
        className='hidden md:flex bg-white text-gray-700 rounded-lg px-3 py-3
        flex-row items-center gap-3 mt-6 w-full max-w-[900px]'
      >
        <div className="flex flex-col w-[180px]">
          <label className="text-sm font-medium mb-1">{t("center.destiny")}</label>
          <select
            className="rounded border border-gray-200 px-3 py-1.5 text-sm outline-none"
            value={selectedDestino}
            onChange={(e) => setSelectedDestino(e.target.value)}
            required
          >
            <option value="">{t("center.destinyselector")}</option>
            {destinos.map((d) => (
              <option key={d.id} value={d.nome}>{d.nome}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
          <div
            onClick={() => openCalendar("start")}
            className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
          >
            <span>{startDate ? startDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
            <Calendar size={16} />
          </div>
        </div>

        <div className="flex flex-col w-[160px]">
          <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
          <div
            onClick={() => openCalendar("end")}
            className="flex items-center justify-between rounded border border-gray-200 px-3 py-1.5 text-sm cursor-pointer"
          >
            <span>{endDate ? endDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
            <Calendar size={16} />
          </div>
        </div>

        <div className="flex flex-col w-[100px]">
          <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
          <input
            type="number"
            min={1}
            className="rounded border border-gray-200 px-3 py-1.5 text-sm"
            placeholder="0"
            required
          />
        </div>

        <button className="rounded-md bg-black py-2 px-5 text-white h-[42px]">
          {t("center.search")}
        </button>
      </form>

      {/* ==================== MOBILE ==================== */}
      <form
        onSubmit={handleSubmit}
        className='md:hidden bg-white text-gray-700 rounded-lg px-4 py-4
        mt-6 w-full max-w-[360px]'
      >
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">Destino</label>
            <select
              className="rounded border border-gray-200 px-3 py-2 text-sm"
              value={selectedDestino}
              onChange={(e) => setSelectedDestino(e.target.value)}
              required
            >
              <option value="">Selecione</option>
              {destinos.map((d) => (
                <option key={d.id} value={d.nome}>{d.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.entrydate")}</label>
            <div
              onClick={() => openCalendar("start")}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm cursor-pointer"
            >
              <span>{startDate ? startDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
              <Calendar size={16} />
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-1">{t("center.outdate")}</label>
            <div
              onClick={() => openCalendar("end")}
              className="flex items-center justify-between rounded border border-gray-200 px-3 py-2 text-sm cursor-pointer"
            >
              <span>{endDate ? endDate.toLocaleDateString() : "dd/mm/yyyy"}</span>
              <Calendar size={16} />
            </div>
          </div>

          <div className="flex flex-col col-span-2">
            <label className="text-sm font-medium mb-1">{t("center.guests")}</label>
            <input
              type="number"
              min={1}
              placeholder="0"
              className="rounded border border-gray-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        <button className="bg-black text-white rounded py-2 mt-4 w-full">
          {t("center.search")}
        </button>
      </form>

      {/* ==================== DATEPICKER ==================== */}
      <DatePicker
        ref={datepickerRef}
        selected={activeField === "start" ? startDate : endDate}
        onChange={(date) => {
  if (activeField === "start") {
    setStartDate(date);

    // 👇 se a nova entrada for depois da saída, limpa a saída
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  } else {
    // 👇 só permite saída depois da entrada
    if (!startDate || date >= startDate) {
      setEndDate(date);
      datepickerRef.current.setOpen(false);
    }
    return;
  }

  datepickerRef.current.setOpen(false);
}}

        minDate={activeField === "end" && startDate ? startDate : new Date()}
        withPortal
        className="hidden"
      />
    </div>
  );
};

export default Center;
