"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Smartphone,
} from "lucide-react";
import { useCartStore, CartItem } from "@/store/cartStore";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

function CartDrawerItemComponent({
  item,
  onUpdateQuantity,
  onRemove,
}: {
  item: CartItem;
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const { product, quantity } = item;
  const isMaxStock = quantity >= product.stock;

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const unitPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <div className="flex gap-4 py-4 first:pt-0 last:pb-0 items-start">
      {/* Miniatura de Imagen */}
      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-[#0B0E14] border border-slate-800 shrink-0">
        {product.image_url && !imgError ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="64px"
            className="object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[#131923] text-slate-500">
            <Smartphone className="w-6 h-6 text-[#00A8FF]/60" />
          </div>
        )}
      </div>

      {/* Información y Controles */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-slate-100 truncate max-w-[180px] sm:max-w-[200px]">
              {product.title}
            </h4>
            <p className="text-xs text-slate-400">{unitPrice} c/u</p>
          </div>

          <button
            type="button"
            onClick={() => onRemove(product.id)}
            aria-label={`Eliminar ${product.title} del carrito`}
            className="p-1.5 text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800/60"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selector de cantidad y subtotal */}
        <div className="flex items-center justify-between mt-3">
          <div className="inline-flex items-center rounded-lg bg-[#0B0E14] border border-slate-800 p-0.5">
            <button
              type="button"
              onClick={() => {
                if (quantity > 1) {
                  onUpdateQuantity(product.id, quantity - 1);
                } else {
                  onRemove(product.id);
                }
              }}
              aria-label="Disminuir cantidad"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-md transition-colors"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>

            <span className="w-8 text-center text-xs font-bold text-white">
              {quantity}
            </span>

            <button
              type="button"
              disabled={isMaxStock}
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              aria-label="Aumentar cantidad"
              className={`p-1.5 rounded-md transition-colors ${
                isMaxStock
                  ? "text-slate-600 cursor-not-allowed"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <span className="text-sm font-extrabold text-white">
            {formattedPrice}
          </span>
        </div>

        {isMaxStock && (
          <span className="text-[10px] text-amber-400 mt-1">
            Stock máximo alcanzado ({product.stock})
          </span>
        )}
      </div>
    </div>
  );
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);

  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const formattedTotalPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(totalPrice);

  // Manejo de scroll en body y atajo con Escape
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen, onClose]);

  // Si no está abierto, no renderizamos nada
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] overflow-hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop oscuro clickeable con efecto blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Contenedor del panel alineado a la derecha */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <aside className="w-screen max-w-md bg-[#0B0E14] border-l border-slate-800 flex flex-col shadow-2xl relative animate-in slide-in-from-right duration-300">
          {/* Cabecera del Drawer */}
          <div className="p-5 sm:p-6 bg-[#131923] border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <h3 className="text-lg sm:text-xl font-black text-white">
                Tu Carrito
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30">
                {totalItems} {totalItems === 1 ? "ítem" : "ítems"}
              </span>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar carrito"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cuerpo con scroll */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            {items.length === 0 ? (
              /* Estado Vacío */
              <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[#131923] border border-slate-800 flex items-center justify-center text-[#00A8FF] shadow-[0_0_20px_rgba(0,168,255,0.12)]">
                  <ShoppingBag className="w-8 h-8" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-bold text-white">
                    Tu carrito está vacío
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-xs leading-relaxed">
                    Aún no agregaste accesorios a tu pedido. Revisá nuestro
                    catálogo con entregas en Cipolletti y alrededores.
                  </p>
                </div>

                <Link
                  href="/catalogo"
                  onClick={onClose}
                  className="mt-2 inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_15px_rgba(0,168,255,0.25)] transition-all active:scale-[0.98]"
                >
                  <span>Explorar catálogo</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              /* Lista scrolleable de ítems */
              <div className="divide-y divide-slate-800/60">
                {items.map((item) => (
                  <CartDrawerItemComponent
                    key={item.product.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Pie del Drawer (Fijo abajo si hay ítems) */}
          {items.length > 0 && (
            <div className="p-5 sm:p-6 bg-[#131923] border-t border-slate-800 space-y-4 shrink-0">
              {/* Desglose del total */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Subtotal ({totalItems} productos)</span>
                  <span>{formattedTotalPrice}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Entrega</span>
                  <span className="text-[#00A8FF]">
                    A coordinar por WhatsApp
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-2 border-t border-slate-800/80">
                  <span className="text-sm font-bold text-slate-200">
                    Total a pagar
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white tracking-tight">
                    {formattedTotalPrice}
                  </span>
                </div>
              </div>

              {/* Botón principal Iniciar compra */}
              <Link
                href="/checkout"
                onClick={onClose}
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.35)] hover:shadow-[0_0_25px_rgba(0,168,255,0.5)] flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <span>Iniciar compra</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              {/* Botón Vaciar carrito */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
                >
                  Vaciar carrito
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
