"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/database";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package,
  Layers,
  AlertTriangle,
  Loader2,
  X,
  ExternalLink,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  // Estado para modal de confirmación de eliminación
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error al cargar productos:", error);
      } else {
        setProducts(data || []);
      }
    } catch (err) {
      console.error("Error inesperado al obtener productos:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Categorías únicas detectadas de los productos
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.trim()) set.add(p.category.trim());
    });
    return ["Todas", ...Array.from(set)];
  }, [products]);

  // Filtrado de productos en memoria
  const filteredProducts = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q));

      const matchesCat =
        selectedCategory === "Todas" ||
        (p.category &&
          p.category.toLowerCase() === selectedCategory.toLowerCase());

      return matchesSearch && matchesCat;
    });
  }, [products, searchQuery, selectedCategory]);

  const confirmDelete = async () => {
    if (!productToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);
      const supabase = createClient();

      // Validar sesión activa antes de eliminar
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setDeleteError("Sesión expirada. Redirigiendo a /admin/login...");
        window.location.href = "/admin/login";
        return;
      }

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productToDelete.id);

      if (error) {
        throw new Error(error.message);
      }

      // Remover del estado local
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setProductToDelete(null);
    } catch (err: any) {
      console.error("Error al eliminar producto:", err);
      setDeleteError(err?.message || "No se pudo eliminar el producto.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabecera del Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Inventario de Productos</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-[#131923] border border-slate-800 text-[#00A8FF]">
              {products.length} {products.length === 1 ? "ítem" : "ítems"}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Administrá precios, stock, imágenes y estado de los productos en la
            tienda.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchProducts}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-[#131923] hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
            title="Recargar catálogo"
          >
            <RefreshCw
              className={`w-4 h-4 ${isLoading ? "animate-spin text-[#00A8FF]" : ""}`}
            />
          </button>

          <Link
            href="/admin/nuevo"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.25)] hover:shadow-[0_0_25px_rgba(0,168,255,0.4)] transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Producto</span>
          </Link>
        </div>
      </div>

      {/* Barra de Filtros: Buscador + Selector de Categoría */}
      <div className="p-4 rounded-2xl bg-[#131923] border border-slate-800 flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por título, categoría o descripción..."
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-xs sm:text-sm transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filtro por Categoría */}
        <div className="sm:w-56">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#00A8FF] text-xs sm:text-sm transition-colors cursor-pointer"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "Todas" ? "Todas las categorías" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabla / Grid Responsive de Productos */}
      {isLoading ? (
        <div className="p-12 rounded-2xl bg-[#131923] border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-[#00A8FF]" />
          <span className="text-xs font-medium">
            Cargando catálogo de productos...
          </span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#131923] border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              No se encontraron productos
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedCategory !== "Todas"
                ? "No hay resultados que coincidan con los filtros aplicados."
                : "Todavía no cargaste ningún producto en la base de datos."}
            </p>
          </div>
          {searchQuery || selectedCategory !== "Todas" ? (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("Todas");
              }}
              className="text-xs text-[#00A8FF] hover:underline cursor-pointer"
            >
              Limpiar filtros de búsqueda
            </button>
          ) : (
            <Link
              href="/admin/nuevo"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#00A8FF] text-[#0B0E14] hover:bg-[#38bdf8] transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Crear el primer producto</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-[#131923] border border-slate-800 shadow-sm">
          {/* Vista Tabla Desktop */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-[#0B0E14]/60 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => {
                  const isOutOfStock = product.stock === 0;
                  const isLowStock = product.stock > 0 && product.stock <= 3;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-800/30 transition-colors group"
                    >
                      {/* Producto: Imagen + Título */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg bg-[#0B0E14] border border-slate-800 overflow-hidden shrink-0">
                            {product.image_url ? (
                              <Image
                                src={product.image_url}
                                alt={product.title}
                                fill
                                sizes="48px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-600">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <span className="font-bold text-white text-sm block truncate group-hover:text-[#00A8FF] transition-colors">
                              {product.title}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono block truncate">
                              ID: {product.id.slice(0, 8)}...
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Categoría */}
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60 inline-block">
                          {product.category || "General"}
                        </span>
                      </td>

                      {/* Precio */}
                      <td className="py-3 px-4">
                        <span className="font-bold font-mono text-white text-sm">
                          {formatCurrency(product.price)}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="py-3 px-4">
                        {isOutOfStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-500/15 text-red-400 border border-red-500/30 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Sin stock (0)
                          </span>
                        ) : isLowStock ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                            Poco stock ({product.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            En stock ({product.stock})
                          </span>
                        )}
                      </td>

                      {/* Estado */}
                      <td className="py-3 px-4">
                        {product.is_active ? (
                          <span className="text-emerald-400 text-xs font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Activo
                          </span>
                        ) : (
                          <span className="text-slate-500 text-xs font-medium">
                            Pausado
                          </span>
                        )}
                      </td>

                      {/* Acciones */}
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5 justify-end">
                          <Link
                            href={`/admin/${product.id}`}
                            className="p-2 rounded-lg bg-[#0B0E14] hover:bg-[#00A8FF]/10 text-slate-400 hover:text-[#00A8FF] border border-slate-800 hover:border-[#00A8FF]/40 transition-colors"
                            title="Editar producto"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setProductToDelete(product)}
                            className="p-2 rounded-lg bg-[#0B0E14] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/40 transition-colors cursor-pointer"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil / Cards */}
          <div className="md:hidden divide-y divide-slate-800">
            {filteredProducts.map((product) => {
              const isOutOfStock = product.stock === 0;
              const isLowStock = product.stock > 0 && product.stock <= 3;

              return (
                <div key={product.id} className="p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="relative w-16 h-16 rounded-xl bg-[#0B0E14] border border-slate-800 overflow-hidden shrink-0">
                      {product.image_url ? (
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-600">
                          <Package className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-white text-sm block truncate">
                        {product.title}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                          {product.category || "General"}
                        </span>
                        <span className="font-bold font-mono text-white text-xs">
                          {formatCurrency(product.price)}
                        </span>
                      </div>
                      <div className="mt-2">
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-red-400">
                            Sin stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-400">
                            Poco stock ({product.stock})
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-400">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/60">
                    <Link
                      href={`/admin/${product.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0B0E14] border border-slate-800 text-slate-300 hover:text-[#00A8FF]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => setProductToDelete(product)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Confirmación de Eliminación */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#131923] border border-slate-800 shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                ¿Eliminar producto?
              </h3>
              <p className="text-xs text-slate-400 mt-1.5">
                Estás a punto de eliminar{" "}
                <span className="text-white font-semibold">
                  "{productToDelete.title}"
                </span>
                . Esta acción no se puede deshacer y quitará el producto del
                catálogo permanentemente.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-[#0B0E14] border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={confirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Sí, eliminar producto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
