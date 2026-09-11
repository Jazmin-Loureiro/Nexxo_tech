"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import {
  CheckCircle2,
  MessageCircle,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function CheckoutSuccessPage() {
  const clearCart = useCartStore((state) => state.clearCart);
  const [mounted, setMounted] = useState(false);

  // Limpiar el carrito en caliente al arribar a la confirmación de pago
  useEffect(() => {
    setMounted(true);
    clearCart();
  }, [clearCart]);

  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappMessage = `¡Hola Nexxo Tech! Acabo de realizar el pago de mi compra por Mercado Pago a través de la tienda web.

Les escribo para enviarles el comprobante y coordinar los detalles de entrega o punto de retiro en Cipolletti. ¡Muchas gracias!`;

  const whatsappUrl = phoneNumber
    ? `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsappMessage)}`
    : "#";

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center px-4 py-16 relative overflow-hidden">
      {/* Luces decorativas de fondo */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#131923] border border-slate-800 shadow-2xl backdrop-blur-sm text-center space-y-6">
          {/* Ícono de Confirmación con Animación Sutil */}
          <div className="relative mx-auto w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.25)]">
            <CheckCircle2 className="w-10 h-10" />
            <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-[#00A8FF] text-[#0B0E14] flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Textos Principales */}
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/30 inline-block">
              PAGO ACREDITADO
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ¡Gracias por tu compra!
            </h1>
            <p className="text-sm text-slate-400 max-w-sm mx-auto leading-relaxed">
              Tu pago fue registrado y aprobado correctamente. Para coordinar la
              entrega o retiro de tus productos, contactanos ahora por WhatsApp.
            </p>
          </div>

          {/* Tarjeta de Coordinación */}
          <div className="p-4 rounded-2xl bg-[#0B0E14] border border-slate-800 text-left space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <ShieldCheck className="w-4 h-4 text-[#00A8FF]" />
              <span>Último paso requerido</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Hacé clic en el botón verde de abajo para abrir el chat con
              nuestro equipo, adjuntar el comprobante y acordar fecha, horario o
              dirección exacta de entrega en Cipolletti y alrededores.
            </p>
          </div>

          {/* Acciones */}
          <div className="space-y-3 pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_25px_rgba(37,211,102,0.35)] hover:shadow-[0_0_35px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>Coordinar entrega por WhatsApp</span>
            </a>

            <Link
              href="/catalogo"
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs text-slate-400 hover:text-white bg-[#0B0E14] hover:bg-slate-800/80 border border-slate-800 transition-colors flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Volver a la tienda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
