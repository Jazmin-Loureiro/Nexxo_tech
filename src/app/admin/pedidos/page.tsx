"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { revalidateProducts } from "@/app/actions/products";
import { ShoppingBag, RefreshCw, Loader2 } from "lucide-react";
import { OrderData } from "@/types/database";
import OrderFilters, {
  StatusFilterType,
  DatePresetType,
} from "@/components/admin/OrderFilters";
import OrderCard from "@/components/admin/OrderCard";

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
  const [statusFilter, setStatusFilter] = useState<StatusFilterType>("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [datePreset, setDatePreset] = useState<DatePresetType>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [processingOrderId, setProcessingOrderId] = useState<string | null>(
    null,
  );

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

  const handleResetAllFilters = () => {
    setStatusFilter("todos");
    setSearchQuery("");
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

  const handleClearDates = () => {
    setDatePreset("all");
    setStartDate("");
    setEndDate("");
  };

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

      {/* Barra de Filtros, Fechas y Métricas */}
      <OrderFilters
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        datePreset={datePreset}
        onDatePresetChange={setDatePreset}
        startDate={startDate}
        onStartDateChange={(d) => {
          setStartDate(d);
          setDatePreset("custom");
        }}
        endDate={endDate}
        onEndDateChange={(d) => {
          setEndDate(d);
          setDatePreset("custom");
        }}
        onClearDates={handleClearDates}
        onResetAllFilters={handleResetAllFilters}
        totalFilteredOrders={filteredOrders.length}
        filteredTotalAmount={filteredTotalAmount}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

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
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isProcessing={processingOrderId === order.id}
              onApproveAndDeduct={handleApproveAndDeduct}
              onMarkAsDelivered={handleMarkAsDelivered}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
