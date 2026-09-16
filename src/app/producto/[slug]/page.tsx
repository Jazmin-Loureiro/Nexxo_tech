import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Product } from "@/types/database";
import ProductDetailView from "./ProductDetailView";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const isUUID = /^[0-9a-fA-F-]{36}$/.test(slug);
  const supabase = await createClient();

  let query = supabase.from("products").select("*");
  if (isUUID) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("slug", slug);
  }

  const { data: product } = await query.maybeSingle();

  if (!product || product.is_active === false) {
    return {
      title: "Producto no encontrado | Nexxo Tech",
      description:
        "El producto que buscas no se encuentra disponible en Nexxo Tech.",
    };
  }

  const title = `${product.title} | Nexxo Tech`;
  const description =
    product.description ||
    `Comprá ${product.title} en Nexxo Tech. Accesorios premium para celulares con envíos y retiros en Cipolletti.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: product.image_url
        ? [
            {
              url: product.image_url,
              width: 800,
              height: 800,
              alt: product.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: product.image_url ? [product.image_url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const isUUID = /^[0-9a-fA-F-]{36}$/.test(slug);
  const supabase = await createClient();

  let query = supabase.from("products").select("*");
  if (isUUID) {
    query = query.eq("id", slug);
  } else {
    query = query.eq("slug", slug);
  }

  const { data: product, error } = await query.maybeSingle();

  if (error || !product || product.is_active === false) {
    notFound();
  }

  return <ProductDetailView product={product as Product} />;
}
