"use client";

import { useMemo, useState } from "react";
import { Search, X, PackageSearch, MessageCircle } from "lucide-react";
import { Product } from "@/types/database";
import ProductCard from "@/components/ProductCard";

interface CatalogViewProps {
  initialProducts: Product[];
}

const DEFAULT_CATEGORIES = [
  "Todos",
  "Auriculares",
  "Cables",
  "Cargadores",
  "Fundas",
  "Soportes",
];

export default function CatalogView({ initialProducts }: CatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  // Combinar categorías predeterminadas con las detectadas en la base de datos
  const categories = useMemo(() => {
    const productCategories = initialProducts
      .map((p) => p.category?.trim())
      .filter((c): c is string => Boolean(c));

    const uniqueSet = new Set([
      "Todos",
      ...DEFAULT_CATEGORIES.slice(1),
      ...productCategories,
    ]);
    return Array.from(uniqueSet);
  }, [initialProducts]);

  // Filtrado reactivo en memoria
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();

    return initialProducts.filter((product) => {
      const matchesQuery =
        !query ||
        product.title.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === "Todos" ||
        (product.category &&
          product.category.trim().toLowerCase() ===
            selectedCategory.trim().toLowerCase());

      return matchesQuery && matchesCategory;
    });
  }, [initialProducts, searchQuery, selectedCategory]);

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCategory !== "Todos";

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("Todos");
  };

  return (
    <div className="space-y-8">
      {/* Barra de Filtros: Buscador + Píldoras de Categoría */}
      <div className="flex flex-col gap-6 p-5 sm:p-6 rounded-2xl bg-[#131923] border border-slate-800 shadow-[0_0_20px_rgba(0,0,0,0.25)]">
        {/* Buscador Input */}
        <div className="relative w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por modelo, tipo de accesorio o marca..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] focus:ring-1 focus:ring-[#00A8FF] transition-all text-sm sm:text-base"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Limpiar búsqueda"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Píldoras de Categorías */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.toLowerCase();
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap active:scale-95 ${
                    isSelected
                      ? "bg-[#00A8FF] text-[#0B0E14] shadow-[0_0_15px_rgba(0,168,255,0.35)]"
                      : "bg-[#0B0E14] text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Botón Reset si hay filtros activos */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-400 hover:text-[#00A8FF] transition-colors self-start sm:self-center"
            >
              Restablecer filtros
            </button>
          )}
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs sm:text-sm text-slate-400 font-medium">
          Mostrando{" "}
          <span className="text-white font-bold">
            {filteredProducts.length}
          </span>{" "}
          de{" "}
          <span className="text-white font-bold">{initialProducts.length}</span>{" "}
          productos
          {selectedCategory !== "Todos" && (
            <span>
              {" "}
              en <span className="text-[#00A8FF]">"{selectedCategory}"</span>
            </span>
          )}
        </p>
      </div>

      {/* Grilla de Productos o Estado Vacío */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Estado amigable si no hay coincidencias */
        <div className="flex flex-col items-center justify-center p-8 sm:p-14 rounded-2xl bg-[#131923] border border-slate-800 text-center max-w-xl mx-auto my-8 shadow-[0_0_30px_rgba(0,0,0,0.3)]">
          <div className="w-16 h-16 rounded-2xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(0,168,255,0.1)]">
            <PackageSearch className="w-8 h-8 text-[#00A8FF]" />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            No encontramos productos con esos filtros
          </h3>

          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            {hasActiveFilters
              ? "Probá buscando con otros términos o seleccionando otra categoría."
              : "Actualmente no hay productos cargados en esta sección."}
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] transition-all"
              >
                Limpiar búsqueda y filtros
              </button>
            )}

            <a
              href="https://wa.me/5492990000000?text=Hola%20Nexxo%20Tech!%20Busco%20un%20accesorio%20específico%20y%20no%20lo%20encuentro%20en%20el%20catálogo..."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs bg-[#0B0E14] border border-slate-800 text-slate-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
