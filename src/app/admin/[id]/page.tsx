"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Product } from "@/types/database";
import ProductForm from "@/components/admin/ProductForm";
import { Edit3, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { revalidateProducts } from "@/app/actions/products";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const supabase = createClient();

        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", productId)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setProduct(data);
      } catch (err: any) {
        console.error("Error al cargar producto:", err);
        setLoadError(err?.message || "No se encontró el producto.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const handleUpdateProduct = async (productData: {
    title: string;
    slug: string;
    category: string;
    price: number;
    stock: number;
    description: string | null;
    image_url: string | null;
    images: string[];
    is_active: boolean;
  }) => {
    const supabase = createClient();

    // Validar que el cliente tenga la sesión activa antes de mutar
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.warn(
        "Sesión de administrador no detectada. Redirigiendo a /admin/login",
      );
      router.push("/admin/login");
      return;
    }

    const { error } = await supabase
      .from("products")
      .update({
        title: productData.title,
        slug: productData.slug,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        image_url: productData.image_url,
        images: productData.images,
        is_active: productData.is_active,
      })
      .eq("id", productId);

    if (error) {
      throw new Error(error.message);
    }

    // Revalidar caché de Server Components y refrescar router
    await revalidateProducts();
    router.refresh();
    router.push("/admin");
  };

  if (isLoading) {
    return (
      <div className="p-16 rounded-2xl bg-[#131923] border border-slate-800 flex flex-col items-center justify-center gap-3 text-slate-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#00A8FF]" />
        <span className="text-xs font-medium">
          Cargando datos del producto...
        </span>
      </div>
    );
  }

  if (loadError || !product) {
    return (
      <div className="p-8 rounded-2xl bg-[#131923] border border-slate-800 text-center space-y-4 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">
            Producto no encontrado
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {loadError ||
              "No se pudo recuperar la información del producto solicitado."}
          </p>
        </div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#0B0E14] border border-slate-800 text-slate-300 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al panel</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-2">
          <Edit3 className="w-3.5 h-3.5" />
          <span>EDICIÓN DE PRODUCTO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Editar: {product.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
          ID: {product.id}
        </p>
      </div>

      {/* Formulario */}
      <ProductForm
        initialData={product}
        onSubmit={handleUpdateProduct}
        submitButtonText="Guardar Cambios"
        isEditing={true}
      />
    </div>
  );
}
