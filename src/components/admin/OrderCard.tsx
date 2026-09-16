"use client";

import { useState } from "react";
import {
  Clock,
  CreditCard,
  Truck,
  CheckCircle2,
  MessageCircle,
  MapPin,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react";
import { OrderData } from "@/types/database";

interface OrderCardProps {
  order: OrderData;
  isProcessing: boolean;
  onApproveAndDeduct: (order: OrderData) => void;
  onMarkAsDelivered: (orderId: string) => void;
  formatCurrency: (amount: number) => string;
  formatDate: (dateStr: string) => string;
}

export default function OrderCard({
  order,
  isProcessing,
  onApproveAndDeduct,
  onMarkAsDelivered,
  formatCurrency,
  formatDate,
}: OrderCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extraer ítems comprados
  const itemsList: any[] = Array.isArray(order.items)
    ? order.items
    : typeof order.items === "string"
      ? (() => {
          try {
            return JSON.parse(order.items);
          } catch {
            return [];
          }
        })()
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
    <div className="p-5 sm:p-6 rounded-2xl bg-[#131923] border border-slate-800 shadow-sm space-y-4 hover:border-slate-700/80 transition-colors">
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
          {(order.status === "paid" || order.status === "approved") && (
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
            <span className="text-slate-400 block">{order.customer_email}</span>
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
            {order.notes ? `"${order.notes}"` : "Sin notas adicionales."}
          </p>
        </div>
      </div>

      {/* Desglose de Productos Acordeón */}
      <div className="pt-2 border-t border-slate-800/60">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex items-center justify-between w-full text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
        >
          <span>Productos ({itemsList.length || 0})</span>
          <div className="flex items-center gap-1 text-[#00A8FF]">
            <span>{isExpanded ? "Ocultar detalle" : "Ver detalle"}</span>
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
            onClick={() => onApproveAndDeduct(order)}
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
            onClick={() => onMarkAsDelivered(order.id)}
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
}
