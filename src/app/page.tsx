import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Truck,
  ShieldCheck,
  CreditCard,
  MessageCircle,
  Package,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types/database";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(4);

  if (error) {
    console.error("Error al consultar productos destacados:", error.message);
  }

  const featuredProducts: Product[] = (data as Product[] | null) ?? [];

  return (
    <div className="flex flex-col min-h-screen bg-[#0B0E14] text-slate-100">
      {/* 1. Hero Tech Banner */}
      <section className="relative overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0e141f] via-[#0B0E14] to-[#0B0E14] py-16 sm:py-24">
        {/* Resplandores ambientales tech */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[#00A8FF]/10 blur-[120px] rounded-full"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/3 right-10 w-72 h-72 bg-[#00A8FF]/5 blur-[100px] rounded-full"
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge superior */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] shadow-[0_0_20px_rgba(0,168,255,0.15)] mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono tracking-wider uppercase">
              Tecnología & Accesorios de Celular
            </span>
          </div>

          {/* Título Principal */}
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
            Potenciá tu smartphone con{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#00A8FF]">
              NEXXO TECH
            </span>
          </h1>

          {/* Claim Oficial */}
          <p className="mt-5 text-base sm:text-xl md:text-2xl font-medium text-slate-300 max-w-2xl">
            Accesorios de celular:{" "}
            <span className="text-[#00A8FF] font-semibold">Calidad</span> •{" "}
            <span className="text-[#00A8FF] font-semibold">Diseño</span> •{" "}
            <span className="text-[#00A8FF] font-semibold">Confianza</span>
          </p>

          {/* Botones de Acción Primaria */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/catalogo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.3)] hover:shadow-[0_0_25px_rgba(0,168,255,0.5)] transition-all active:scale-[0.98]"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/como-comprar"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-medium text-sm bg-[#131923] hover:bg-[#1a2332] text-slate-200 hover:text-white border border-slate-800 hover:border-slate-700 transition-all"
            >
              <span>¿Cómo comprar?</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Sección de Productos Destacados */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 border-b border-slate-800/60">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 pb-4 border-b border-slate-800/60">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-[#00A8FF]">
              Lo más reciente
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Productos Destacados
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Selección de accesorios listos para entrega inmediata
            </p>
          </div>

          <Link
            href="/catalogo"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-[#00A8FF] hover:text-[#38bdf8] transition-colors group"
          >
            <span>Ver catálogo completo</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {featuredProducts.length > 0 ? (
          <div className="space-y-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Botón Destacado hacia Catálogo */}
            <div className="flex justify-center pt-2">
              <Link
                href="/catalogo"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-sm bg-[#131923] hover:bg-[#1a2332] text-[#00A8FF] hover:text-white border border-[#00A8FF]/40 hover:border-[#00A8FF] shadow-[0_0_20px_rgba(0,168,255,0.15)] hover:shadow-[0_0_25px_rgba(0,168,255,0.3)] transition-all duration-200 group"
              >
                <span>Ver catálogo completo</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 sm:p-12 rounded-2xl bg-[#131923] border border-slate-800 text-center max-w-xl mx-auto shadow-[0_0_30px_rgba(0,0,0,0.3)]">
            <div className="w-16 h-16 rounded-2xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,168,255,0.1)]">
              <Package className="w-8 h-8 text-[#00A8FF]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Catálogo en actualización
            </h3>
            <p className="text-sm text-slate-400 mb-6 max-w-sm">
              Estamos preparando nuevos ingresos para la tienda. Podés ver el
              catálogo completo o consultarnos por WhatsApp.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/catalogo"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#00A8FF] text-[#0B0E14] hover:bg-[#38bdf8] transition-colors"
              >
                Ir al Catálogo
              </Link>
              <a
                href="https://wa.me/5492990000000?text=Hola%20Nexxo%20Tech,%20quiero%20consultar%20por%20accesorios%20disponibles"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#131923] border border-slate-800 text-slate-300 hover:text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Consultar por WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </section>

      {/* 3. Bloque de Garantías y Propuesta de Valor */}
      <section className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-widest text-[#00A8FF]">
            ¿Por qué elegirnos?
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Garantía y Confianza Nexxo Tech
          </h2>
          <p className="text-sm text-slate-400 mt-2">
            Comprá con tranquilidad y recibí tus accesorios rápidamente en tu
            zona
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Envíos Locales */}
          <div className="flex flex-col p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mb-5 text-[#00A8FF] group-hover:scale-110 transition-transform">
              <Truck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Envíos Rápidos Locales
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Entregas coordinadas en el día o en 24 hs en Neuquén Capital,
              Plottier, Cipolletti y Centenario. ¡Sin esperas eternas de envíos
              nacionales!
            </p>
          </div>

          {/* Card 2: Calidad Asegurada */}
          <div className="flex flex-col p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mb-5 text-[#00A8FF] group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Calidad Asegurada
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Cada accesorio es testeado antes de salir. Garantía real en
              cables, cargadores, fundas y dispositivos para que cuides tu
              teléfono sin riesgos.
            </p>
          </div>

          {/* Card 3: Pagos y Atención */}
          <div className="flex flex-col p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/30 transition-all duration-300 group">
            <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mb-5 text-[#00A8FF] group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              Mercado Pago & Transferencia
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Pagá con tarjeta, dinero en cuenta o transferencia bancaria
              inmediata. Atención y asesoramiento directo y personalizado por
              WhatsApp.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
