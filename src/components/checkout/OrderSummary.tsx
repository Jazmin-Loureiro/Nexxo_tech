"use client";

import Image from "next/image";
import {
  CreditCard,
  Wallet,
  MessageCircle,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
} from "lucide-react";
import { CartItem } from "@/store/cartStore";

interface OrderSummaryProps {
  items: CartItem[];
  totalPrice: number;
  deliveryMethod: "pickup" | "shipping_cipo" | "shipping_other";
  paymentMethod: "transfer" | "mercadopago";
  surchargeAmount: number;
  finalTotal: number;
  formatCurrency: (val: number) => string;
  hasOutOfStockItems: boolean;
  isProcessing: boolean;
  isMercadoPagoDisabled: boolean;
  mpError: string | null;
  onTransferSubmit: () => void;
  onMercadoPagoSubmit: () => void;
}

export default function OrderSummary({
  items,
  totalPrice,
  deliveryMethod,
  paymentMethod,
  surchargeAmount,
  finalTotal,
  formatCurrency,
  hasOutOfStockItems,
  isProcessing,
  isMercadoPagoDisabled,
  mpError,
  onTransferSubmit,
  onMercadoPagoSubmit,
}: OrderSummaryProps) {
  return (
    <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-6 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <h3 className="text-lg font-bold text-white">Resumen del Pedido</h3>
        <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
          {items.length} {items.length === 1 ? "ítem" : "ítems"}
        </span>
      </div>

      {/* Lista compacta de productos */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-slate-800/60">
        {items.map((item) => (
          <div
            key={item.product.id}
            className="flex items-center gap-3.5 pt-3 first:pt-0"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0B0E14] border border-slate-800 shrink-0">
              {item.product.image_url ? (
                <Image
                  src={item.product.image_url}
                  alt={item.product.title}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-[#131923] text-slate-500">
                  <Smartphone className="w-5 h-5 text-[#00A8FF]/60" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                  {item.product.title}
                </h4>
                {(!item.product.is_active || item.product.stock <= 0) && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                    Sin stock
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                <span>Cant: {item.quantity}</span>
                <span className="font-semibold text-white">
                  {formatCurrency(item.product.price * item.quantity)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Totales y Desglose */}
      <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
        <div className="flex items-center justify-between">
          <span>Subtotal</span>
          <span className="font-semibold text-white">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span>Envío</span>
          <span
            className={`font-semibold ${
              deliveryMethod === "shipping_other"
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {deliveryMethod === "shipping_other"
              ? "A coordinar por WhatsApp"
              : "Gratis"}
          </span>
        </div>

        {/* Recargo Mercado Pago (10%) */}
        {paymentMethod === "mercadopago" && (
          <div className="flex items-center justify-between text-amber-300 font-medium animate-in fade-in duration-200">
            <span>Recargo Mercado Pago (10%)</span>
            <span>+{formatCurrency(surchargeAmount)}</span>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80 text-base">
          <span className="font-bold text-white">Total a pagar</span>
          <span className="text-2xl font-black text-white tracking-tight">
            {formatCurrency(finalTotal)}
          </span>
        </div>
      </div>

      {/* Mensaje de error visual si falla Mercado Pago */}
      {mpError && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold block">Error al procesar pago</span>
            <span>{mpError}</span>
          </div>
        </div>
      )}

      {/* Alerta de productos sin stock */}
      {hasOutOfStockItems && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5 animate-in fade-in duration-200">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              Productos sin stock en el pedido
            </span>
            <span>
              Algunos accesorios de tu pedido ya no cuentan con stock
              disponible. Por favor, modificalos en tu carrito para poder
              continuar.
            </span>
          </div>
        </div>
      )}

      {/* Botón de Acción Principal */}
      <div>
        {paymentMethod === "transfer" ? (
          <button
            type="button"
            onClick={onTransferSubmit}
            disabled={hasOutOfStockItems}
            className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_25px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-current" />
            <span>
              {hasOutOfStockItems
                ? "No disponible (Productos sin stock)"
                : "Confirmar y Enviar Pedido por WhatsApp"}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={onMercadoPagoSubmit}
            disabled={
              isProcessing || isMercadoPagoDisabled || hasOutOfStockItems
            }
            className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_25px_rgba(0,168,255,0.3)] hover:shadow-[0_0_30px_rgba(0,168,255,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none cursor-pointer"
          >
            <Wallet className="w-5 h-5" />
            <span>
              {hasOutOfStockItems
                ? "No disponible (Productos sin stock)"
                : isProcessing
                  ? "Conectando con Mercado Pago..."
                  : `Pagar ${formatCurrency(finalTotal)} con Mercado Pago`}
            </span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
        <ShieldCheck className="w-4 h-4 text-[#00A8FF]" />
        <span>Compra protegida y directa con Nexxo Tech</span>
      </div>
    </div>
  );
}
