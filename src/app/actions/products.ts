"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalida la caché de Server Components en las rutas públicas
 * de inicio y catálogo tras operaciones de creación, edición o borrado.
 */
export async function revalidateProducts() {
  try {
    revalidatePath("/", "layout");
    revalidatePath("/catalogo");
    return { success: true };
  } catch (error) {
    console.error("Error al revalidar rutas de productos:", error);
    return { success: false };
  }
}
