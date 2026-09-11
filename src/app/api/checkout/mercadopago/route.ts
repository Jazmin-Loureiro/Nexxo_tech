import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, payer, deliveryMethod, shippingDetails, notes } = body;

    // 1. Validar que el método de entrega no sea "shipping_other"
    if (deliveryMethod === "shipping_other") {
      return NextResponse.json(
        {
          error:
            "El método de entrega fuera de Cipolletti requiere coordinación previa y no admite Mercado Pago directo.",
        },
        { status: 400 },
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "No se recibieron productos válidos en la solicitud." },
        { status: 400 },
      );
    }

    // 2. Configurar MercadoPagoConfig
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      console.error(
        "Error: Falta configurar la variable de entorno MERCADOPAGO_ACCESS_TOKEN.",
      );
      return NextResponse.json(
        {
          error:
            "La pasarela de Mercado Pago no está configurada en el servidor (falta MERCADOPAGO_ACCESS_TOKEN).",
        },
        { status: 500 },
      );
    }

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);

    // 3. Normalizar ítems originales
    const preferenceItems = items.map((item: any) => {
      const title = item.title || item.product?.title || "Accesorio Nexxo Tech";
      const quantity = Number(item.quantity) || 1;
      const unit_price = Number(
        item.unit_price ?? item.price ?? item.product?.price ?? 0,
      );
      const id = String(item.id || item.product?.id || "");

      return {
        id,
        title,
        quantity,
        unit_price,
        currency_id: "ARS",
      };
    });

    // 4. Calcular recargo del 10% sobre el subtotal de productos
    const subtotal = preferenceItems.reduce(
      (acc: number, item: any) => acc + item.unit_price * item.quantity,
      0,
    );
    const surchargeAmount = Math.round(subtotal * 0.1);

    const surchargeItem = {
      id: "surcharge-10",
      title: "Costo por gestión de plataforma y pasarela (10%)",
      quantity: 1,
      unit_price: surchargeAmount,
      currency_id: "ARS",
    };

    // 5. Determinar origen para URLs de retorno de forma segura
    const origin =
      request.headers.get("origin") ||
      request.headers.get("referer")?.replace(/\/checkout.*$/, "") ||
      "http://localhost:3000";

    const isHttps = origin.startsWith("https://");

    const payerPhone = payer?.phone?.trim()
      ? { number: String(payer.phone).trim() }
      : undefined;

    // 6. Crear la Preference en Mercado Pago SDK v2
    const response = await preference.create({
      body: {
        items: [...preferenceItems, surchargeItem],
        payer: {
          name: payer?.fullName?.trim() || "Cliente Nexxo Tech",
          email: payer?.email?.trim() || "cliente@nexxotech.com",
          phone: payerPhone,
        },
        back_urls: {
          success: `${origin}/catalogo?status=success`,
          failure: `${origin}/checkout?status=failure`,
          pending: `${origin}/checkout?status=pending`,
        },
        ...(isHttps ? { auto_return: "approved" } : {}),
        metadata: {
          full_name: payer?.fullName || payer?.name,
          phone: payer?.phone,
          email: payer?.email,
          delivery_method: deliveryMethod,
          address: shippingDetails?.address || "",
          city: shippingDetails?.city || "",
          notes: notes || "",
          subtotal,
          surcharge: surchargeAmount,
          total: subtotal + surchargeAmount,
        },
      },
    });

    return NextResponse.json({ init_point: response.init_point });
  } catch (error: any) {
    console.error("Error al crear preferencia en Mercado Pago:", error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          "Ocurrió un error inesperado al procesar la preferencia de Mercado Pago.",
      },
      { status: 500 },
    );
  }
}
