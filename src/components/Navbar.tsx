"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

const NAV_LINKS = [
  { label: "Inicio", href: "/" },
  { label: "Catálogo", href: "/catalogo" },
  { label: "Cómo comprar", href: "/como-comprar" },
  { label: "Contacto", href: "/contacto" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  useEffect(() => {
    setMounted(true);
  }, []);

  // Cerrar menú mobile al cambiar de ruta
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const displayCount = mounted ? totalItems : 0;

  return (
    <div className="sticky top-0 z-40 w-full transition-colors">
      {/* Announcement Bar Superior */}
      <div className="w-full bg-[#131923] border-b border-slate-800/80 px-4 py-2 text-center text-xs font-medium text-slate-300 flex items-center justify-center gap-2">
        <span className="text-[#00A8FF]">📍</span>
        <span>
          Entregas en Cipolletti y alrededores{" "}
          <span className="text-slate-600 hidden sm:inline">•</span>{" "}
          <span className="text-slate-400">
            Pagos con Mercado Pago o Transferencia
          </span>
        </span>
      </div>

      {/* Barra de Navegación Principal */}
      <header className="w-full backdrop-blur-md bg-[#0B0E14]/85 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
          {/* Logo / Marca */}
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl sm:text-2xl font-black tracking-tight text-white transition-opacity hover:opacity-95"
          >
            <span className="font-mono uppercase tracking-widest text-slate-100 group-hover:text-white transition-colors">
              NEXXO
              <span className="text-[#00A8FF] drop-shadow-[0_0_8px_rgba(0,168,255,0.6)]">
                _TECH
              </span>
            </span>
          </Link>

          {/* Enlaces de Navegación Desktop */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "text-[#00A8FF] bg-[#00A8FF]/10 font-semibold border border-[#00A8FF]/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Lado derecho: Carrito + Botón menú mobile */}
          <div className="flex items-center gap-2.5">
            {/* Botón del Carrito */}
            <Link
              href="/cart"
              aria-label="Ver carrito de compras"
              className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-[#131923] border border-slate-800 text-slate-200 hover:text-white hover:border-[#00A8FF]/60 hover:bg-[#1a2332] transition-all duration-200 shadow-sm group"
            >
              <ShoppingCart className="w-5 h-5 transition-transform duration-200 group-hover:scale-110 group-hover:text-[#00A8FF]" />

              {displayCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1.5 flex items-center justify-center text-[11px] font-bold text-[#0B0E14] bg-[#00A8FF] rounded-full shadow-[0_0_10px_rgba(0,168,255,0.7)] animate-in fade-in zoom-in-75 duration-200">
                  {displayCount}
                </span>
              )}
            </Link>

            {/* Toggle Menú Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={
                mobileMenuOpen ? "Cerrar menú" : "Abrir menú de navegación"
              }
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl bg-[#131923] border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800/80 bg-[#0B0E14] px-4 py-5 animate-in slide-in-from-top-2 duration-200 shadow-2xl">
            <nav className="flex flex-col gap-1.5">
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#00A8FF] bg-[#00A8FF]/10 font-bold border border-[#00A8FF]/20"
                        : "text-slate-300 hover:text-white hover:bg-[#131923]"
                    }`}
                  >
                    <span>{link.label}</span>
                    <ArrowRight
                      className={`w-4 h-4 ${
                        isActive ? "text-[#00A8FF]" : "text-slate-600"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </div>
  );
}
