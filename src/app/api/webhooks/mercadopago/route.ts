import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    let paymentId =
      url.searchParams.get("data.id") || url.searchParams.get("id");

    try {
      const body = await request.json();
      if (body?.data?.id) {
        paymentId = String(body.data.id);
      } else if (body?.id && (body?.type === "payment" || !paymentId)) {
        paymentId = String(body.id);
      }
    } catch {
      // Puede ser un webhook sin cuerpo JSON (parámetros en querystring)
    }

    // Si no se detectó un ID de pago, confirmar recepción a Mercado Pago
    if (!paymentId) {
      return NextResponse.json(
        {
          received: true,
          message: "No se identificó payment ID en la notificación.",
        },
        { status: 200 },
      );
    }

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error("Error en webhook MP: Falta MERCADOPAGO_ACCESS_TOKEN.");
      return NextResponse.json(
        { received: true, error: "Config missing" },
        { status: 200 },
      );
    }

    // 1. Consultar estado del pago en Mercado Pago
    const client = new MercadoPagoConfig({ accessToken });
    const paymentClient = new Payment(client);
    const paymentData = await paymentClient.get({ id: paymentId });

    // 2. Procesar únicamente cuando el pago esté aprobado
    if (paymentData.status === "approved") {
      const metadata = paymentData.metadata || {};
      const supabase = await createClient();

      // Deserializar ítems de metadata si vienen como JSON string
      let items: any[] = [];
      if (typeof metadata.items === "string") {
        try {
          items = JSON.parse(metadata.items);
        } catch {
          items = [];
        }
      } else if (Array.isArray(metadata.items)) {
        items = metadata.items;
      }

      // 3. Verificar si la orden ya existe por payment_id (idempotencia)
      const { data: existingOrder } = await supabase
        .from("orders")
        .select("id, status")
        .eq("payment_id", String(paymentId))
        .maybeSingle();

      // Si ya fue procesada y acreditada, evitar descontar stock doble
      const alreadyPaid =
        existingOrder &&
        (existingOrder.status === "paid" ||
          existingOrder.status === "delivered");

      if (!alreadyPaid) {
        const orderData = {
          customer_name:
            metadata.full_name ||
            `${paymentData.payer?.first_name || ""} ${paymentData.payer?.last_name || ""}`.trim() ||
            "Cliente Mercado Pago",
          customer_phone:
            metadata.phone || paymentData.payer?.phone?.number || "",
          customer_email: metadata.email || paymentData.payer?.email || null,
          shipping_address:
            metadata.delivery_method === "pickup"
              ? "Punto de retiro en Cipolletti"
              : metadata.address
                ? `${metadata.address}${metadata.city ? `, ${metadata.city}` : ""}`
                : "A coordinar por WhatsApp",
          delivery_method: metadata.delivery_method || "shipping_cipo",
          total_amount: paymentData.transaction_amount || metadata.total || 0,
          status: "paid",
          payment_id: String(paymentId),
          payment_method: "mercadopago",
          notes: metadata.notes || null,
          items: items.length > 0 ? items : null,
        };

        if (existingOrder) {
          await supabase
            .from("orders")
            .update({ status: "paid" })
            .eq("id", existingOrder.id);
        } else {
          await supabase.from("orders").insert([orderData]);
        }

        // 4. Descontar stock en Supabase para cada ítem adquirido
        if (items.length > 0) {
          for (const item of items) {
            const itemId = item.id || item.product_id;
            if (!itemId) continue;

            const { data: product } = await supabase
              .from("products")
              .select("id, stock")
              .eq("id", itemId)
              .maybeSingle();

            if (product) {
              const currentStock = Number(product.stock) || 0;
              const quantityToDeduct = Number(item.quantity) || 1;
              const newStock = Math.max(0, currentStock - quantityToDeduct);

              await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", itemId);
            }
          }
        }

        // 5. Revalidar caché pública de productos
        revalidatePath("/", "layout");
        revalidatePath("/catalogo");
      }
    }

    // Responder siempre HTTP 200 para confirmar recepción exitosa a Mercado Pago
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error al procesar webhook de Mercado Pago:", error);
    return NextResponse.json(
      { received: true, error: error?.message || "Internal error" },
      { status: 200 },
    );
  }
}
