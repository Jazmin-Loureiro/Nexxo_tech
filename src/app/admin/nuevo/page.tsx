"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import ProductForm from "@/components/admin/ProductForm";
import { PackagePlus } from "lucide-react";

export default function NewProductPage() {
  const router = useRouter();

  const handleCreateProduct = async (productData: {
    title: string;
    slug: string;
    category: string;
    price: number;
    stock: number;
    description: string | null;
    image_url: string | null;
    is_active: boolean;
  }) => {
    const supabase = createClient();

    // Validar que el cliente tenga la sesión activa antes de insertar
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

    // Inserción en la tabla 'products'
    const { error } = await supabase.from("products").insert([
      {
        title: productData.title,
        slug: productData.slug,
        category: productData.category,
        price: productData.price,
        stock: productData.stock,
        description: productData.description,
        image_url: productData.image_url,
        is_active: productData.is_active,
      },
    ]);

    if (error) {
      // Si falla por slug duplicado, reintentar con sufijo único
      if (error.code === "23505" || error.message.includes("slug")) {
        const uniqueSlug = `${productData.slug}-${Math.random().toString(36).substring(2, 7)}`;
        const retry = await supabase.from("products").insert([
          {
            ...productData,
            slug: uniqueSlug,
          },
        ]);
        if (retry.error) throw new Error(retry.error.message);
      } else {
        throw new Error(error.message);
      }
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="space-y-6">
      {/* Cabecera */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-2">
          <PackagePlus className="w-3.5 h-3.5" />
          <span>ALTA DE PRODUCTO</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Agregar Nuevo Producto
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Completá los detalles para publicar un nuevo accesorio en la tienda
          Nexxo Tech.
        </p>
      </div>

      {/* Formulario */}
      <ProductForm
        onSubmit={handleCreateProduct}
        submitButtonText="Publicar Producto"
        isEditing={false}
      />
    </div>
  );
}
