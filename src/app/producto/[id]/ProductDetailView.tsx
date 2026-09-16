"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  MessageCircle,
  Truck,
  MapPin,
  ShieldCheck,
  Smartphone,
  Minus,
  Plus,
  CreditCard,
  AlertCircle,
} from "lucide-react";
import { Product } from "@/types/database";
import { useCartStore } from "@/store/cartStore";

interface ProductDetailViewProps {
  product: Product;
}

export default function ProductDetailView({ product }: ProductDetailViewProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);

  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const openCart = useCartStore((state) => state.openCart);

  const cartItem = items.find((item) => item.product.id === product.id);
  const quantityInCart = cartItem ? cartItem.quantity : 0;
  const isOutOfStock = product.stock <= 0;
  const remainingStock = Math.max(0, product.stock - quantityInCart);
  const isMaxCartReached = !isOutOfStock && remainingStock === 0;

  // Ajustar el contador local si el stock remanente disponible cambia
  useEffect(() => {
    if (remainingStock > 0 && quantity > remainingStock) {
      setQuantity(remainingStock);
    } else if (remainingStock === 0) {
      setQuantity(1);
    }
  }, [remainingStock, quantity]);

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  const surchargeAmount = Math.round(product.price * 0.1);
  const priceWithMarkup = product.price + surchargeAmount;
  const formattedPriceWithMarkup = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceWithMarkup);

  const handleAddToCart = () => {
    if (isOutOfStock || remainingStock <= 0) return;

    const amountToAdd = Math.min(quantity, remainingStock);
    const targetTotal = quantityInCart + amountToAdd;

    if (!cartItem) {
      addItem(product);
    }
    updateQuantity(product.id, targetTotal);

    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);

    // Resetear contador local a 1 para evitar acumulaciones no intencionadas
    setQuantity(1);

    // Abrir drawer del carrito para feedback inmediato
    openCart();
  };

  const phoneNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+5492995103149";
  const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `¡Hola Nexxo Tech! Tengo una consulta sobre el producto "${product.title}" (${formattedPrice}).`,
  )}`;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-8 sm:py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Migas de pan / Volver */}
        <div>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-[#00A8FF] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Volver al catálogo</span>
          </Link>
        </div>

        {/* Layout en 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Columna Izquierda: Imagen Principal (7 columnas) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative w-full aspect-square sm:aspect-[4/3] lg:aspect-square bg-[#131923] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Badge de Envío Gratis */}
              <div className="absolute top-4 left-4 z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-lg">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Envío gratis en Cipolletti</span>
                </span>
              </div>

              {/* Imagen o Fallback */}
              {product.image_url && !hasImageError ? (
                <Image
                  src={product.image_url}
                  alt={product.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  onError={() => setHasImageError(true)}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-[#101622] to-[#080b10] text-center select-none">
                  <div className="w-24 h-24 rounded-3xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,168,255,0.12)]">
                    <Smartphone className="w-12 h-12 text-[#00A8FF]" />
                  </div>
                  <span className="text-sm font-mono tracking-widest text-slate-400 uppercase font-bold">
                    NEXXO_TECH
                  </span>
                  <span className="text-xs text-slate-500 mt-1">
                    Accesorio Premium para tu Smartphone
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Columna Derecha: Información y Compra (5 columnas) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-3">
              {product.category && (
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20 inline-block">
                  {product.category}
                </span>
              )}

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                {product.title}
              </h1>

              {/* Estado de Stock */}
              <div>
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span>Agotado / Sin stock</span>
                  </span>
                ) : product.stock <= 3 ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300">
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span>
                      Últimas {product.stock}{" "}
                      {product.stock === 1 ? "unidad" : "unidades"} disponibles
                    </span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>En stock ({product.stock} disponibles)</span>
                  </span>
                )}
              </div>
            </div>

            {/* Caja de Precio y Opciones de Pago */}
            <div className="p-5 rounded-2xl bg-[#131923] border border-slate-800 space-y-2.5 shadow-sm">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {formattedPrice}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Efectivo o Transferencia Bancaria
                </span>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-300/90">
                <CreditCard className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Con Mercado Pago:{" "}
                  <strong className="text-white">
                    {formattedPriceWithMarkup}
                  </strong>{" "}
                  (+10% por costo de servicio/pasarela)
                </span>
              </div>
            </div>

            {/* Descripción del Producto */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
                Descripción
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {product.description ||
                  "Accesorio de alta calidad, diseñado para brindar la máxima protección y durabilidad a tu teléfono móvil."}
              </p>
            </div>

            {/* Selector de Cantidad y Acciones */}
            <div className="space-y-4 pt-2">
              {!isOutOfStock && (
                <div className="p-3.5 rounded-xl bg-[#131923] border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold text-slate-300">
                      Cantidad a agregar:
                    </span>
                    <div className="flex items-center rounded-lg bg-[#0B0E14] border border-slate-800 p-1">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        disabled={quantity <= 1 || remainingStock <= 0}
                        className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-white font-mono">
                        {remainingStock <= 0 ? 0 : quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setQuantity((q) => Math.min(remainingStock, q + 1))
                        }
                        disabled={
                          quantity >= remainingStock || remainingStock <= 0
                        }
                        className="w-8 h-8 rounded flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Estado contextual del carrito para este producto */}
                  {quantityInCart > 0 && (
                    <div className="flex items-center justify-between text-[11px] pt-2 border-t border-slate-800/80">
                      <span className="text-slate-400">En tu carrito:</span>
                      <span className="font-semibold text-[#00A8FF]">
                        {quantityInCart}{" "}
                        {quantityInCart === 1 ? "unidad" : "unidades"}
                        {remainingStock > 0 ? (
                          <span className="text-slate-400 font-normal">
                            {" "}
                            (podés sumar hasta {remainingStock} más)
                          </span>
                        ) : (
                          <span className="text-amber-400 font-medium">
                            {" "}
                            (stock total alcanzado)
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Botón Principal: Agregar al Carrito */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock || isMaxCartReached}
                className={`w-full py-4 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-200 active:scale-[0.98] ${
                  isAdded
                    ? "bg-emerald-500 text-white shadow-[0_0_25px_rgba(16,185,129,0.35)]"
                    : isMaxCartReached
                      ? "bg-slate-800/80 text-slate-400 border border-slate-700/50 cursor-not-allowed"
                      : "bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_25px_rgba(0,168,255,0.3)] hover:shadow-[0_0_30px_rgba(0,168,255,0.5)]"
                } disabled:cursor-not-allowed disabled:shadow-none`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-5 h-5 text-white animate-in zoom-in" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : isOutOfStock ? (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>Producto Sin Stock</span>
                  </>
                ) : isMaxCartReached ? (
                  <>
                    <Check className="w-5 h-5 text-[#00A8FF]" />
                    <span>Stock Máximo en Carrito ({quantityInCart})</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      {quantity > 1
                        ? `Agregar ${quantity} unidades al Carrito`
                        : "Agregar al Carrito"}
                    </span>
                  </>
                )}
              </button>

              {/* Botón Secundario: WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#131923] hover:bg-[#1a2332] text-white border border-slate-800 hover:border-[#25D366]/40 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] group"
              >
                <MessageCircle className="w-5 h-5 text-[#25D366] group-hover:scale-110 transition-transform" />
                <span>Consultar por WhatsApp sobre este producto</span>
              </a>
            </div>

            {/* Tarjetas de Beneficios de Compra */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-800/80">
              <div className="p-3.5 rounded-xl bg-[#131923] border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <MapPin className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Retiro Gratis</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Punto de retiro céntrico en Cipolletti.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131923] border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-[#00A8FF]">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Envíos Rápidos</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  En Cipolletti y alrededores a coordinar.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#131923] border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-bold">Pago Seguro</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Transferencia bancaria o Mercado Pago.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
