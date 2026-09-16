"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Smartphone, AlertCircle } from "lucide-react";
import { Product } from "@/types/database";
import { useCartStore } from "@/store/cartStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [hasImageError, setHasImageError] = useState(false);
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  const cartItem = items.find((item) => item.product.id === product.id);
  const currentInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0;
  const isLimitReached = !isOutOfStock && currentInCart >= product.stock;
  const isDisabled = isOutOfStock || isLimitReached;

  const formattedPrice = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  let buttonText = "Agregar al carrito";
  if (isOutOfStock) {
    buttonText = "Sin stock";
  } else if (isLimitReached) {
    buttonText = "Límite alcanzado";
  }

  return (
    <article className="group flex flex-col bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/40 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,168,255,0.12)]">
      {/* Contenedor de Imagen con Fallback Tech */}
      <Link
        href={`/producto/${product.slug || product.id}`}
        className="relative w-full aspect-square bg-[#0B0E14] overflow-hidden border-b border-slate-800/80 block cursor-pointer"
      >
        {product.image_url && !hasImageError ? (
          <Image
            src={product.image_url}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setHasImageError(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[#0e141f] to-[#080b10] text-center select-none">
            <div className="w-16 h-16 rounded-2xl bg-[#131923] border border-slate-800/80 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(0,168,255,0.08)] group-hover:border-[#00A8FF]/30 transition-colors">
              <Smartphone className="w-8 h-8 text-[#00A8FF]/80 group-hover:text-[#00A8FF] transition-colors" />
            </div>
            <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
              NEXXO_TECH
            </span>
            <span className="text-[11px] text-slate-600 mt-1">
              Accesorio Premium
            </span>
          </div>
        )}

        {/* Badge de Stock */}
        <div className="absolute top-3 left-3 z-10">
          {isOutOfStock ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/15 border border-red-500/30 text-red-400 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
              Sin stock
            </span>
          ) : product.stock <= 3 ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-400 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              Últimas unidades
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              En stock
            </span>
          )}
        </div>

        {/* Badge de cantidad en carrito actual si ya hay agregados */}
        {currentInCart > 0 && !isOutOfStock && (
          <div className="absolute top-3 right-3 z-10">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#00A8FF]/20 border border-[#00A8FF]/40 text-[#00A8FF] backdrop-blur-md">
              {currentInCart} en carrito
            </span>
          </div>
        )}
      </Link>

      {/* Información del Producto */}
      <div className="p-5 flex flex-col flex-1 justify-between gap-4">
        <div className="space-y-2">
          <Link
            href={`/producto/${product.slug || product.id}`}
            className="block group/title"
          >
            <h3 className="text-base sm:text-lg font-bold text-slate-100 group-hover/title:text-[#00A8FF] transition-colors line-clamp-1">
              {product.title}
            </h3>
          </Link>
          <p className="text-sm text-slate-400 line-clamp-2 min-h-[2.5rem] leading-relaxed">
            {product.description ||
              "Accesorio de alta calidad garantizada para tu dispositivo."}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-800/60">
          <div className="flex items-baseline justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500">
              Precio
            </span>
            <span className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            type="button"
            onClick={() => addItem(product)}
            disabled={isDisabled}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
              isDisabled
                ? "bg-slate-800/60 text-slate-500 border border-slate-700/40 cursor-not-allowed"
                : "bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_15px_rgba(0,168,255,0.25)] hover:shadow-[0_0_20px_rgba(0,168,255,0.45)] active:scale-[0.98]"
            }`}
          >
            {isDisabled ? (
              <AlertCircle className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>{buttonText}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
