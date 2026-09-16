"use client";

import { Search, Calendar, X } from "lucide-react";

export type StatusFilterType = "todos" | "pending" | "paid" | "delivered";
export type DatePresetType = "all" | "today" | "7days" | "month" | "custom";

interface OrderFiltersProps {
  statusFilter: StatusFilterType;
  onStatusFilterChange: (status: StatusFilterType) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  datePreset: DatePresetType;
  onDatePresetChange: (preset: DatePresetType) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  onClearDates: () => void;
  onResetAllFilters: () => void;
  totalFilteredOrders: number;
  filteredTotalAmount: number;
  isLoading: boolean;
  formatCurrency: (amount: number) => string;
}

export default function OrderFilters({
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchQueryChange,
  datePreset,
  onDatePresetChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onClearDates,
  onResetAllFilters,
  totalFilteredOrders,
  filteredTotalAmount,
  isLoading,
  formatCurrency,
}: OrderFiltersProps) {
  const isAnyFilterActive =
    statusFilter !== "todos" ||
    searchQuery.trim() !== "" ||
    datePreset !== "all" ||
    startDate !== "" ||
    endDate !== "";

  return (
    <div className="space-y-4">
      {/* Barra de Filtros, Fechas y Búsqueda */}
      <div className="p-4 rounded-2xl bg-[#131923] border border-slate-800 space-y-4 shadow-sm">
        {/* Fila 1: Pestañas de Estado y Buscador */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
          {/* Pestañas de Estado */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            {[
              { id: "todos", label: "Todos" },
              { id: "pending", label: "Pendientes" },
              { id: "paid", label: "Pagados" },
              { id: "delivered", label: "Entregados" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => onStatusFilterChange(tab.id as StatusFilterType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  statusFilter === tab.id
                    ? "bg-[#00A8FF] text-[#0B0E14] shadow-[0_0_15px_rgba(0,168,255,0.25)]"
                    : "bg-[#0B0E14] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Buscador */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.target.value)}
              placeholder="Buscar por cliente o teléfono..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-xs transition-colors"
            />
          </div>
        </div>

        {/* Fila 2: Filtros de Fecha */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
          {/* Presets de Fecha */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <div className="flex items-center gap-1 text-slate-400 text-xs mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#00A8FF]" />
              <span className="font-semibold text-slate-300">Fecha:</span>
            </div>
            {[
              { id: "all", label: "Todos" },
              { id: "today", label: "Hoy" },
              { id: "7days", label: "Últimos 7 días" },
              { id: "month", label: "Este mes" },
            ].map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => onDatePresetChange(preset.id as DatePresetType)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  datePreset === preset.id
                    ? "bg-[#00A8FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,168,255,0.25)] font-bold"
                    : "bg-[#0B0E14] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Rango Personalizado de Fechas (Desde / Hasta) y Limpiar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <label
                htmlFor="startDateInput"
                className="text-xs text-slate-400 font-medium"
              >
                Desde:
              </label>
              <input
                id="startDateInput"
                type="date"
                value={startDate}
                onChange={(e) => onStartDateChange(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl bg-[#0B0E14] border text-slate-200 text-xs focus:outline-none focus:border-[#00A8FF] transition-colors [color-scheme:dark] ${
                  datePreset === "custom" && startDate
                    ? "border-[#00A8FF]/60"
                    : "border-slate-800"
                }`}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <label
                htmlFor="endDateInput"
                className="text-xs text-slate-400 font-medium"
              >
                Hasta:
              </label>
              <input
                id="endDateInput"
                type="date"
                value={endDate}
                onChange={(e) => onEndDateChange(e.target.value)}
                className={`px-2.5 py-1.5 rounded-xl bg-[#0B0E14] border text-slate-200 text-xs focus:outline-none focus:border-[#00A8FF] transition-colors [color-scheme:dark] ${
                  datePreset === "custom" && endDate
                    ? "border-[#00A8FF]/60"
                    : "border-slate-800"
                }`}
              />
            </div>

            {(datePreset !== "all" || startDate !== "" || endDate !== "") && (
              <button
                type="button"
                onClick={onClearDates}
                className="px-2.5 py-1.5 rounded-xl bg-[#0B0E14] hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Limpiar filtros de fecha"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Limpiar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Resumen Métrico */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span>
              Mostrando{" "}
              <strong className="text-white font-semibold">
                {totalFilteredOrders}
              </strong>{" "}
              {totalFilteredOrders === 1 ? "pedido" : "pedidos"}
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Total:{" "}
              <strong className="text-[#00A8FF] font-bold font-mono">
                {formatCurrency(filteredTotalAmount)} ARS
              </strong>
            </span>
          </div>

          {isAnyFilterActive && (
            <button
              type="button"
              onClick={onResetAllFilters}
              className="text-slate-400 hover:text-white transition-colors text-[11px] underline underline-offset-2 self-start sm:self-auto cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
}
