"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/database";
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  DollarSign,
  Package,
  Layers,
  FileText,
  Eye,
  Trash2,
} from "lucide-react";

interface ProductFormProps {
  initialData?: Partial<Product>;
  onSubmit: (data: {
    title: string;
    slug: string;
    category: string;
    price: number;
    stock: number;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
  }) => Promise<void>;
  submitButtonText: string;
  isEditing?: boolean;
}

const COMMON_CATEGORIES = [
  "Auriculares",
  "Cables",
  "Cargadores",
  "Fundas",
  "Soportes",
  "Accesorios",
  "Otros",
];

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProductForm({
  initialData,
  onSubmit,
  submitButtonText,
  isEditing = false,
}: ProductFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(
    initialData?.category || "Auriculares",
  );
  const [customCategory, setCustomCategory] = useState("");
  const [price, setPrice] = useState(
    initialData?.price ? String(initialData.price) : "",
  );
  const [stock, setStock] = useState(
    initialData?.stock !== undefined ? String(initialData.stock) : "0",
  );
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [imageUrl, setImageUrl] = useState<string | null>(
    initialData?.image_url || null,
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.is_active ?? true,
  );

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Manejo de carga de archivos a Supabase Storage bucket 'product-images'
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación de extensiones permitidas
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setImageError("Formato no válido. Usá JPG, PNG o WEBP.");
      return;
    }

    try {
      setIsUploadingImage(true);
      setImageError(null);

      // Nombre único y sanitizado: ${Date.now()}-${file.name.replace(/\s+/g, '_')}
      const sanitizedName = file.name.replace(/\s+/g, "_");
      const fileName = `${Date.now()}-${sanitizedName}`;

      const supabase = createClient();

      // Validar que el cliente tenga la sesión activa antes de subir al bucket
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setImageError(
          "Sesión no válida o expirada. Por favor, volvé a iniciar sesión.",
        );
        setIsUploadingImage(false);
        return;
      }

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      // Obtener URL pública desde el bucket
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(fileName);

      setImageUrl(publicUrl);
    } catch (err: any) {
      console.error("Error al subir imagen a Supabase Storage:", err);
      setImageError(
        err?.message || "No se pudo subir la imagen. Verificá tu conexión.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(null);
    setImageError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10);

    if (!title.trim()) {
      setFormError("El título del producto es obligatorio.");
      return;
    }

    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Ingresá un precio válido en ARS mayor o igual a 0.");
      return;
    }

    if (isNaN(parsedStock) || parsedStock < 0) {
      setFormError("El stock debe ser un número entero mayor o igual a 0.");
      return;
    }

    const finalCategory =
      category === "Otro..."
        ? customCategory.trim() || "Varios"
        : category.trim();

    // Generar slug manteniendo o creando
    const finalSlug = initialData?.slug || generateSlug(title);

    try {
      setIsSubmitting(true);
      await onSubmit({
        title: title.trim(),
        slug: finalSlug,
        category: finalCategory,
        price: parsedPrice,
        stock: parsedStock,
        description: description.trim() || null,
        image_url: imageUrl,
        is_active: isActive,
      });
    } catch (err: any) {
      console.error("Error al guardar producto:", err);
      setFormError(err?.message || "Ocurrió un error al guardar los cambios.");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
      {/* Mensaje de Error General */}
      {formError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-sm text-red-400 flex items-start gap-3 animate-in fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Error al procesar</span>
            <span>{formError}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Columna Izquierda: Información Principal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 rounded-2xl bg-[#131923] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <FileText className="w-4 h-4 text-[#00A8FF]" />
              Información Básica
            </h2>

            {/* Título */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Título del Producto <span className="text-[#00A8FF]">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Auriculares Bluetooth Nexxo Bass Pro"
                className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-sm transition-colors"
              />
            </div>

            {/* Categoría */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Categoría
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 focus:outline-none focus:border-[#00A8FF] text-sm transition-colors cursor-pointer"
                >
                  {COMMON_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="Otro...">Otro (especificar)...</option>
                </select>
              </div>

              {category === "Otro..." && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Nueva Categoría
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ej: Parlantes, Smartwatches..."
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-sm transition-colors"
                  />
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Descripción detallada
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Especificaciones técnicas, compatibilidad, colores disponibles, etc..."
                className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-sm transition-colors resize-y"
              />
            </div>
          </div>

          {/* Precio y Stock */}
          <div className="p-6 rounded-2xl bg-[#131923] border border-slate-800 space-y-5">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <DollarSign className="w-4 h-4 text-[#00A8FF]" />
              Precio e Inventario
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Precio ARS */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Precio (ARS $) <span className="text-[#00A8FF]">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 font-mono text-sm">
                    $
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="15000"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-sm font-mono transition-colors"
                  />
                </div>
              </div>

              {/* Stock */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Unidades en Stock <span className="text-[#00A8FF]">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  placeholder="10"
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] text-sm font-mono transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Imagen y Estado */}
        <div className="space-y-6">
          {/* Carga de Imagen con Supabase Storage */}
          <div className="p-6 rounded-2xl bg-[#131923] border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <ImageIcon className="w-4 h-4 text-[#00A8FF]" />
              Imagen del Producto
            </h2>

            {/* Previsualización */}
            <div className="relative w-full aspect-square rounded-xl bg-[#0B0E14] border border-slate-800 overflow-hidden flex items-center justify-center group">
              {imageUrl ? (
                <>
                  <Image
                    src={imageUrl}
                    alt="Vista previa del producto"
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                      title="Eliminar imagen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : isUploadingImage ? (
                <div className="flex flex-col items-center gap-2 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-[#00A8FF]" />
                  <span className="text-xs font-medium">
                    Subiendo a storage...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500 p-4 text-center">
                  <UploadCloud className="w-10 h-10 text-slate-600" />
                  <span className="text-xs">Sin imagen seleccionada</span>
                </div>
              )}
            </div>

            {/* Error de imagen */}
            {imageError && (
              <p className="text-xs text-red-400 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{imageError}</span>
              </p>
            )}

            {/* Input para seleccionar archivo local */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Subir archivo local (JPG, PNG, WEBP)
              </label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={isUploadingImage}
                onChange={handleFileChange}
                className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#00A8FF]/10 file:text-[#00A8FF] hover:file:bg-[#00A8FF]/20 file:cursor-pointer cursor-pointer"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Se almacena automáticamente en el bucket público{" "}
                <code className="text-slate-400">product-images</code>.
              </p>
            </div>
          </div>

          {/* Visibilidad / Estado */}
          <div className="p-6 rounded-2xl bg-[#131923] border border-slate-800 space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800/80 pb-3">
              <Eye className="w-4 h-4 text-[#00A8FF]" />
              Estado y Visibilidad
            </h2>

            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="mt-1 w-4 h-4 rounded bg-[#0B0E14] border-slate-700 text-[#00A8FF] focus:ring-[#00A8FF] focus:ring-offset-[#0B0E14]"
              />
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Producto Activo en Tienda
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Si se desmarca, el producto se ocultará del catálogo público
                  sin eliminarse.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Barra de Acciones / Submit */}
      <div className="flex items-center justify-between gap-4 pt-4 border-t border-slate-800">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-[#131923] hover:bg-slate-800 border border-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancelar y volver</span>
        </Link>

        <button
          type="submit"
          disabled={isSubmitting || isUploadingImage}
          className="py-3 px-6 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.3)] hover:shadow-[0_0_25px_rgba(0,168,255,0.45)] flex items-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Guardando producto...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitButtonText}</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
