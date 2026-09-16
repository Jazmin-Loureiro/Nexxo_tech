"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateProducts } from "@/app/actions/products";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MessageCircle,
  RefreshCw,
  Loader2,
  Search,
  ExternalLink,
  MapPin,
  FileText,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Calendar,
  X,
} from "lucide-react";

interface OrderData {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  shipping_address: string | null;
  delivery_method: string;
  total_amount: number;
  status: "pending" | "paid" | "approved" | "delivered" | "rejected";
  payment_id: string | null;
  payment_method: "mercadopago" | "transfer" | string;
  notes: string | null;
  items: any;
  created_at: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<
    "todos" | "pending" | "paid" | "delivered"
  >("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<
    "all" | "today" | "7days" | "month" | "custom"
  >("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null,
  );
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>(
    {},
  );

  const toggleExpand = (id: string) => {
    setExpandedOrders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = "/admin/login";
        return;
      }

      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data as OrderData[]);
      } else if (error) {
        console.error("Error al cargar pedidos:", error);
      }
    } catch (err) {
      console.error("Excepción al cargar pedidos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApproveAndDeduct = async (order: OrderData) => {
    try {
      setProcessingOrderId(order.id);
      const supabase = createClient();

      // 1. Descontar stock en Supabase de cada ítem del pedido
      const itemsList = Array.isArray(order.items)
        ? order.items
        : typeof order.items === "string"
          ? JSON.parse(order.items)
          : [];

      if (itemsList.length > 0) {
        for (const item of itemsList) {
          const itemId = item.id || item.product_id;
          if (!itemId) continue;

          const { data: product } = await supabase
            .from("products")
            .select("id, stock")
            .eq("id", itemId)
            .maybeSingle();

          if (product) {
            const currentStock = Number(product.stock) || 0;
            const quantityToDeduct = Number(item.quantity) || 1;
            const newStock = Math.max(0, currentStock - quantityToDeduct);

            await supabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", itemId);
          }
        }
      }

      // 2. Cambiar estado de orden a 'paid'
      const { error: orderError } = await supabase
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id);

      if (orderError) throw new Error(orderError.message);

      // 3. Revalidar caché pública de catálogo
      await revalidateProducts();

      // Actualizar estado local
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: "paid" } : o)),
      );
    } catch (err: any) {
      console.error("Error al aprobar pedido:", err);
      alert(err?.message || "No se pudo aprobar la orden.");
    } finally {
      setProcessingOrderId(null);
    }
  };

  const handleMarkAsDelivered = async (orderId: string) => {
    try {
      setProcessingOrderId(orderId);
      const supabase = createClient();

      const { error } = await supabase
        .from("orders")
        .update({ status: "delivered" })
        .eq("id", orderId);

      if (error) throw new Error(error.message);

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "delivered" } : o)),
      );
    } catch (err: any) {
      console.error("Error al marcar como entregado:", err);
      alert(err?.message || "No se pudo actualizar el estado.");
    } finally {
      setProcessingOrderId(null);
    }
  };

  // Filtrar pedidos por estado, fecha y búsqueda
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Filtro de estado
      if (statusFilter === "pending" && order.status !== "pending")
        return false;
      if (
        statusFilter === "paid" &&
        order.status !== "paid" &&
        order.status !== "approved"
      )
        return false;
      if (statusFilter === "delivered" && order.status !== "delivered")
        return false;

      // Filtro de fecha
      if (datePreset !== "all") {
        const orderDate = new Date(order.created_at);
        if (isNaN(orderDate.getTime())) return false;
        const now = new Date();

        if (datePreset === "today") {
          const isToday =
            orderDate.getFullYear() === now.getFullYear() &&
            orderDate.getMonth() === now.getMonth() &&
            orderDate.getDate() === now.getDate();
          if (!isToday) return false;
        } else if (datePreset === "7days") {
          const sevenDaysAgo = new Date(
            now.getTime() - 7 * 24 * 60 * 60 * 1000,
          );
          if (orderDate < sevenDaysAgo) return false;
        } else if (datePreset === "month") {
          const startOfMonth = new Date(
            now.getFullYear(),
            now.getMonth(),
            1,
            0,
            0,
            0,
            0,
          );
          if (orderDate < startOfMonth) return false;
        } else if (datePreset === "custom") {
          if (startDate) {
            const start = new Date(`${startDate}T00:00:00`);
            if (orderDate < start) return false;
          }
          if (endDate) {
            const end = new Date(`${endDate}T23:59:59.999`);
            if (orderDate > end) return false;
          }
        }
      }

      // Filtro de búsqueda
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        order.customer_name?.toLowerCase().includes(q) ||
        order.customer_phone?.toLowerCase().includes(q) ||
        order.customer_email?.toLowerCase().includes(q) ||
        order.shipping_address?.toLowerCase().includes(q) ||
        order.id?.toLowerCase().includes(q)
      );
    });
  }, [orders, statusFilter, searchQuery, datePreset, startDate, endDate]);

  // Suma total de los pedidos filtrados
  const filteredTotalAmount = useMemo(() => {
    return filteredOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0,
    );
  }, [filteredOrders]);

  return (
    <div className="space-y-6">
      {/* Cabecera del Panel de Pedidos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Gestión de Pedidos</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#131923] border border-slate-800 text-[#00A8FF]">
              {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Supervisá compras acreditadas por Mercado Pago y pedidos de
            transferencia.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={isLoading}
          className="self-start sm:self-auto p-2.5 rounded-xl bg-[#131923] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2 text-xs font-medium"
          title="Recargar pedidos"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00A8FF]" : ""}`}
          />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Barra de Filtros, Fechas y Búsqueda */}
      <div className="p-4 rounded-2xl bg-[#131923] border border-slate-800 space-y-4">
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
                onClick={() => setStatusFilter(tab.id as any)}
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
              onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => {
                  setDatePreset(preset.id as any);
                  setStartDate("");
                  setEndDate("");
                }}
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
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setDatePreset("custom");
                }}
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
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setDatePreset("custom");
                }}
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
                onClick={() => {
                  setDatePreset("all");
                  setStartDate("");
                  setEndDate("");
                }}
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
                {filteredOrders.length}
              </strong>{" "}
              {filteredOrders.length === 1 ? "pedido" : "pedidos"}
            </span>
            <span className="text-slate-600">•</span>
            <span>
              Total:{" "}
              <strong className="text-[#00A8FF] font-bold font-mono">
                {formatCurrency(filteredTotalAmount)} ARS
              </strong>
            </span>
          </div>

          {(statusFilter !== "todos" ||
            searchQuery.trim() !== "" ||
            datePreset !== "all" ||
            startDate !== "" ||
            endDate !== "") && (
            <button
              type="button"
              onClick={() => {
                setStatusFilter("todos");
                setSearchQuery("");
                setDatePreset("all");
                setStartDate("");
                setEndDate("");
              }}
              className="text-slate-400 hover:text-white transition-colors text-[11px] underline underline-offset-2 self-start sm:self-auto cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          )}
        </div>
      )}

      {/* Listado de Pedidos */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-[#131923] border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A8FF]" />
          <span className="text-xs font-medium">Cargando pedidos...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#131923] border border-slate-800 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-white">
            No se encontraron pedidos
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ||
            statusFilter !== "todos" ||
            datePreset !== "all" ||
            startDate !== "" ||
            endDate !== ""
              ? "No hay órdenes que coincidan con los filtros seleccionados."
              : "Aún no se han registrado pedidos en la tienda."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isProcessing = processingOrderId === order.id;
            const isExpanded = expandedOrders[order.id] ?? false;

            // Extraer ítems comprados
            const itemsList: any[] = Array.isArray(order.items)
              ? order.items
              : typeof order.items === "string"
                ? JSON.parse(order.items)
                : [];

            // Limpiar teléfono para WhatsApp
            const rawPhone = order.customer_phone || "";
            const cleanPhone = rawPhone.replace(/[^0-9]/g, "");
            const whatsappChatUrl = cleanPhone
              ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                  `¡Hola ${order.customer_name}! Te contactamos desde Nexxo Tech respecto a tu pedido #${order.id.slice(0, 8)}...`,
                )}`
              : null;

            return (
              <div
                key={order.id}
                className="p-5 sm:p-6 rounded-2xl bg-[#131923] border border-slate-800 shadow-sm space-y-4 hover:border-slate-700/80 transition-colors"
              >
                {/* Cabecera de la Orden */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold text-slate-300">
                      #{order.id.slice(0, 8)}
                    </span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {formatDate(order.created_at)}
                    </span>

                    {/* Badge de Método de Pago */}
                    {order.payment_method === "mercadopago" ? (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30 inline-flex items-center gap-1">
                        <CreditCard className="w-3 h-3" />
                        Mercado Pago
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1">
                        Transferencia
                      </span>
                    )}

                    {/* Badge de Estado */}
                    {order.status === "pending" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Pendiente
                      </span>
                    )}
                    {(order.status === "paid" ||
                      order.status === "approved") && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Pagado
                      </span>
                    )}
                    {order.status === "delivered" && (
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/15 text-blue-400 border border-blue-500/30 inline-flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5" />
                        Entregado
                      </span>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="text-lg sm:text-xl font-black font-mono text-white">
                      {formatCurrency(order.total_amount)}
                    </span>
                  </div>
                </div>

                {/* Datos del Comprador y Entrega */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Col 1: Comprador */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                      Comprador
                    </span>
                    <span className="font-bold text-white text-sm block">
                      {order.customer_name}
                    </span>
                    {order.customer_email && (
                      <span className="text-slate-400 block">
                        {order.customer_email}
                      </span>
                    )}
                    {order.customer_phone && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-slate-300 font-mono">
                          {order.customer_phone}
                        </span>
                        {whatsappChatUrl && (
                          <a
                            href={whatsappChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#25D366]/15 text-[#25D366] hover:bg-[#25D366]/25 border border-[#25D366]/30 font-bold text-[11px] transition-colors"
                          >
                            <MessageCircle className="w-3 h-3 fill-current" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Col 2: Entrega */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                      Entrega
                    </span>
                    <div className="flex items-start gap-1.5 text-slate-200">
                      <MapPin className="w-3.5 h-3.5 text-[#00A8FF] shrink-0 mt-0.5" />
                      <span>
                        {order.shipping_address || "Sin dirección especificada"}
                      </span>
                    </div>
                  </div>

                  {/* Col 3: Notas adicionales */}
                  <div className="space-y-1">
                    <span className="font-semibold text-slate-400 block uppercase tracking-wider text-[10px]">
                      Notas del Pedido
                    </span>
                    <p className="text-slate-300 italic">
                      {order.notes
                        ? `"${order.notes}"`
                        : "Sin notas adicionales."}
                    </p>
                  </div>
                </div>

                {/* Desglose de Productos Acordeón */}
                <div className="pt-2 border-t border-slate-800/60">
                  <button
                    type="button"
                    onClick={() => toggleExpand(order.id)}
                    className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                  >
                    <span>Productos ({itemsList.length || 0})</span>
                    <div className="flex items-center gap-1 text-[#00A8FF]">
                      <span>
                        {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3.5 rounded-xl bg-[#0B0E14] border border-slate-800 space-y-2 animate-in fade-in duration-150">
                      {itemsList.length === 0 ? (
                        <p className="text-xs text-slate-500">
                          No hay detalle de productos guardado para esta orden.
                        </p>
                      ) : (
                        itemsList.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-xs py-1 border-b border-slate-800/40 last:border-0"
                          >
                            <span className="font-medium text-slate-200">
                              {item.title || item.product?.title || "Accesorio"}
                              <span className="text-slate-400 ml-1.5">
                                x{item.quantity}
                              </span>
                            </span>
                            <span className="font-mono text-white font-bold">
                              {formatCurrency(
                                (item.unit_price ?? item.price ?? 0) *
                                  (item.quantity || 1),
                              )}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Barra de Acciones del Pedido */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800/80">
                  {/* Si es pendiente: Botón para aprobar y descontar stock */}
                  {order.status === "pending" && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleApproveAndDeduct(order)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>Aprobar y descontar stock</span>
                    </button>
                  )}

                  {/* Si está pagado pero no entregado: Botón para marcar como entregado */}
                  {(order.status === "paid" || order.status === "approved") && (
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => handleMarkAsDelivered(order.id)}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_15px_rgba(0,168,255,0.25)] transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Truck className="w-3.5 h-3.5" />
                      )}
                      <span>Marcar como entregado</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
