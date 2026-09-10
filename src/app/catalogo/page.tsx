import { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/database";
import CatalogView from "@/components/CatalogView";

export const metadata: Metadata = {
  title: "Catálogo Completo | Nexxo Tech",
  description:
    "Explorá todos los accesorios para celular disponibles en Nexxo Tech: auriculares, cables, cargadores rápidos, fundas y más con entrega en Cipolletti y alrededores.",
};

export const revalidate = 0;

export default async function CatalogoPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error al obtener productos en /catalogo:", error.message);
  }

  const products: Product[] = (data as Product[] | null) ?? [];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera del Catálogo */}
        <div className="mb-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-3">
            <span className="font-mono uppercase tracking-wider">
              Tienda Oficial
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
            Catálogo de Accesorios
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-2 max-w-2xl">
            Encontrá el accesorio ideal para tu smartphone. Calidad garantizada,
            stock inmediato y envíos express en Cipolletti y alrededores.
          </p>
        </div>

        {/* Vista interactiva del catálogo */}
        <CatalogView initialProducts={products} />
      </div>
    </div>
  );
}
