"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  Truck,
  MapPin,
  CreditCard,
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  MessageCircle,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createClient } from "@/lib/supabase/client";

type DeliveryMethod = "pickup" | "shipping_cipo" | "shipping_other";

interface FormData {
  fullName: string;
  phone: string;
  email: string;
  deliveryMethod: DeliveryMethod;
  address: string;
  city: string;
  paymentMethod: "transfer" | "mercadopago";
  notes: string;
}

export default function CheckoutPage() {
  const [mounted, setMounted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState("");
  const [mpError, setMpError] = useState<string | null>(null);

  const items = useCartStore((state) => state.items);
  const getTotalPrice = useCartStore((state) => state.getTotalPrice);
  const clearCart = useCartStore((state) => state.clearCart);
  const syncProducts = useCartStore((state) => state.syncProducts);
  const hasOutOfStockItems = useCartStore((state) =>
    state.hasOutOfStockItems(),
  );

  const totalPrice = getTotalPrice();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    phone: "",
    email: "",
    deliveryMethod: "shipping_cipo",
    address: "",
    city: "",
    paymentMethod: "transfer",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {},
  );

  // Regla: Mercado Pago no disponible si la entrega es fuera de Cipolletti
  const isMercadoPagoDisabled = formData.deliveryMethod === "shipping_other";

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sincronizar reactivamente el inventario y precios con Supabase al cargar el checkout
  useEffect(() => {
    if (items.length === 0) return;
    const itemIds = items.map((i) => i.product.id);
    const supabase = createClient();

    const fetchLatestProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, title, price, stock, is_active")
        .in("id", itemIds);

      if (!error && data) {
        syncProducts(data as any);
      }
    };

    fetchLatestProducts();
  }, [items.length, syncProducts]);

  // Si cambia el método de entrega a fuera de Cipolletti y estaba Mercado Pago, cambiar a transfer
  useEffect(() => {
    if (
      formData.deliveryMethod === "shipping_other" &&
      formData.paymentMethod === "mercadopago"
    ) {
      setFormData((prev) => ({ ...prev, paymentMethod: "transfer" }));
    }
  }, [formData.deliveryMethod, formData.paymentMethod]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);

  // Recargo del 10% si se paga con Mercado Pago
  const surchargeAmount =
    formData.paymentMethod === "mercadopago" ? Math.round(totalPrice * 0.1) : 0;
  const finalTotal = totalPrice + surchargeAmount;

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (
        field === "deliveryMethod" &&
        value === "shipping_other" &&
        prev.paymentMethod === "mercadopago"
      ) {
        updated.paymentMethod = "transfer";
      }
      return updated;
    });
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Por favor, ingresá tu nombre completo.";
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 6) {
      newErrors.phone =
        "Ingresá un teléfono válido para coordinar por WhatsApp.";
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      newErrors.email = "Ingresá un correo electrónico válido.";
    }

    if (formData.deliveryMethod === "shipping_cipo") {
      if (!formData.address.trim()) {
        newErrors.address =
          "Ingresá tu dirección de entrega en Cipolletti (calle, número, piso/depto).";
      }
    } else if (formData.deliveryMethod === "shipping_other") {
      if (!formData.city.trim()) {
        newErrors.city =
          "Indicá la localidad o barrio (Neuquén, Plottier, Fernández Oro, etc.).";
      }
      if (!formData.address.trim()) {
        newErrors.address =
          "Ingresá tu dirección aproximada o punto de referencia.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getDeliverySummaryLabel = () => {
    switch (formData.deliveryMethod) {
      case "pickup":
        return "Punto de retiro en Cipolletti (Gratis)";
      case "shipping_cipo":
        return "Envío a domicilio en Cipolletti (Gratis)";
      case "shipping_other":
        return `Entrega fuera de Cipolletti${formData.city ? ` (${formData.city})` : ""}`;
    }
  };

  const handleTransferSubmit = () => {
    if (!validateForm()) return;

    const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

    if (!phoneNumber) {
      console.error(
        "Falta configurar la variable de entorno NEXT_PUBLIC_WHATSAPP_NUMBER.",
      );
      alert(
        "Error de configuración: Falta configurar el número de WhatsApp (NEXT_PUBLIC_WHATSAPP_NUMBER).",
      );
      return;
    }

    let deliveryDetail = "";
    if (formData.deliveryMethod === "pickup") {
      deliveryDetail =
        "• Punto de retiro en Cipolletti (Gratis)\n  (Coordinar punto de encuentro céntrico en Cipolletti)";
    } else if (formData.deliveryMethod === "shipping_cipo") {
      deliveryDetail = `• Envío a domicilio en Cipolletti (Gratis)\n  Dirección: ${formData.address}`;
    } else {
      deliveryDetail = `• Entrega fuera de Cipolletti (Sujeto a coordinación)\n  Localidad/Barrio: ${formData.city}\n  Dirección aprox.: ${formData.address}\n  (Nota: Coordinar costo de envío y factibilidad)`;
    }

    const productLines = items
      .map(
        (i) =>
          `• ${i.product.title} x${i.quantity} (${formatCurrency(i.product.price * i.quantity)})`,
      )
      .join("\n");

    const shippingCostText =
      formData.deliveryMethod === "shipping_other"
        ? "*Envío:* A coordinar por WhatsApp"
        : "*Envío:* Gratis";

    const notesSection = formData.notes.trim()
      ? `\n\n*Aclaraciones / Notas:*\n${formData.notes.trim()}`
      : "";

    const messageText = `¡Hola Nexxo Tech! Quiero confirmar mi pedido desde la tienda web:

*Datos del Comprador:*
• Nombre: ${formData.fullName}
• Teléfono: ${formData.phone}
• Email: ${formData.email}

*Método de Entrega:*
${deliveryDetail}

*Forma de Pago:*
• Transferencia Bancaria / Efectivo

*Detalle de Productos:*
${productLines}

*Total de Productos:* ${formatCurrency(totalPrice)}
${shippingCostText}${notesSection}

Quedo atento para coordinar los detalles de entrega y los datos de pago. ¡Muchas gracias!`;

    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageText)}`;

    setWhatsappLink(whatsappUrl);
    clearCart();
    setOrderCompleted(true);
    window.location.href = whatsappUrl;
  };

  const handleMercadoPagoSubmit = async () => {
    if (!validateForm()) return;

    if (isMercadoPagoDisabled) {
      alert(
        "Mercado Pago no está disponible para entregas a coordinar fuera de Cipolletti.",
      );
      return;
    }

    setMpError(null);
    setIsProcessing(true);

    try {
      const res = await fetch("/api/checkout/mercadopago", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            id: item.product.id,
            title: item.product.title,
            quantity: item.quantity,
            unit_price: item.product.price,
          })),
          payer: {
            fullName: formData.fullName,
            phone: formData.phone,
            email: formData.email,
          },
          deliveryMethod: formData.deliveryMethod,
          shippingDetails: {
            address: formData.address,
            city: formData.city,
          },
          notes: formData.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.init_point) {
        throw new Error(
          data.error ||
            "No se pudo iniciar el proceso de pago con Mercado Pago.",
        );
      }

      // Redirigir a Mercado Pago Checkout Pro
      window.location.href = data.init_point;
    } catch (err: any) {
      console.error("Error al procesar pago con Mercado Pago:", err);
      setMpError(
        err.message ||
          "Ocurrió un problema al conectar con Mercado Pago. Podés confirmar tu pedido por WhatsApp mientras tanto.",
      );
      setIsProcessing(false);
    }
  };

  // Evitar desajuste de hidratación antes del montaje de Zustand
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex items-center justify-center p-6">
        <div className="w-8 h-8 rounded-full border-2 border-[#00A8FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  // Estado completado con éxito (Transferencia)
  if (orderCompleted) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-16 px-4 flex items-center justify-center">
        <div className="max-w-lg w-full bg-[#131923] border border-slate-800 rounded-3xl p-8 text-center space-y-6 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="w-20 h-20 rounded-2xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mx-auto text-[#00A8FF] shadow-[0_0_30px_rgba(0,168,255,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-[#00A8FF]" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¡Pedido Enviado a WhatsApp!
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Hemos abierto el chat de WhatsApp con el resumen de tu compra. Si
              no se abrió automáticamente, podés hacer clic en el botón de
              abajo.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800/80 text-left space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Cliente:</span>
              <span className="font-bold text-white">{formData.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Entrega:</span>
              <span className="font-bold text-[#00A8FF]">
                {getDeliverySummaryLabel()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pago:</span>
              <span className="font-bold text-white">
                Transferencia / Efectivo
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_20px_rgba(37,211,102,0.35)] hover:shadow-[0_0_25px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Abrir conversación en WhatsApp</span>
              </a>
            )}

            <Link
              href="/catalogo"
              className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-[#0B0E14] hover:bg-[#1a2332] text-slate-300 hover:text-white border border-slate-800 transition-colors"
            >
              Volver al Catálogo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Estado vacío si no hay ítems en el carrito
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-[#131923] border border-slate-800 rounded-3xl p-8 sm:p-10 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-[#0B0E14] border border-slate-800 flex items-center justify-center mx-auto text-[#00A8FF] shadow-[0_0_25px_rgba(0,168,255,0.12)]">
            <ShoppingBag className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">
              Tu carrito está vacío
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              No tienes ningún accesorio agregado actualmente. Explorá nuestro
              catálogo para armar tu pedido.
            </p>
          </div>

          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-6 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.3)] transition-all"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Cabecera */}
        <div className="border-b border-slate-800/80 pb-6">
          <Link
            href="/catalogo"
            className="text-xs font-semibold text-slate-400 hover:text-[#00A8FF] transition-colors mb-2 inline-block"
          >
            ← Volver al catálogo
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Finalizar Compra
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Completá tus datos para coordinar el envío o retiro de tus
            accesorios
          </p>
        </div>

        {/* Layout en 2 columnas */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Columna Izquierda: Formulario (7 columnas) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Sección 1: Datos Personales */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] text-xs font-mono font-bold">
                  1
                </span>
                <span>Datos de Contacto</span>
              </h2>

              <div className="space-y-4 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Nombre y Apellido <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    placeholder="Ej: Juan Pérez"
                    className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                      errors.fullName ? "border-red-500" : "border-slate-800"
                    } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                  />
                  {errors.fullName && (
                    <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.fullName}</span>
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Teléfono / WhatsApp{" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      placeholder="Ej: 299 1234567"
                      className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                        errors.phone ? "border-red-500" : "border-slate-800"
                      } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                    />
                    {errors.phone && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.phone}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      placeholder="juan@ejemplo.com"
                      className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                        errors.email ? "border-red-500" : "border-slate-800"
                      } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                    />
                    {errors.email && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.email}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Tipo de Entrega (3 opciones excluyentes) */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] text-xs font-mono font-bold">
                  2
                </span>
                <span>Método de Entrega</span>
              </h2>

              <div className="space-y-3 pt-1">
                {/* Opción 1: Punto de retiro en Cipolletti (Gratis) */}
                <button
                  type="button"
                  onClick={() => handleChange("deliveryMethod", "pickup")}
                  className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                    formData.deliveryMethod === "pickup"
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.15)]"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#131923] border border-slate-800 mt-0.5">
                      <MapPin
                        className={`w-5 h-5 ${
                          formData.deliveryMethod === "pickup"
                            ? "text-[#00A8FF]"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Punto de retiro en Cipolletti (Gratis)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Gratis
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Coordinamos un punto de encuentro céntrico por WhatsApp.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      formData.deliveryMethod === "pickup"
                        ? "border-[#00A8FF] bg-[#00A8FF]"
                        : "border-slate-700"
                    }`}
                  >
                    {formData.deliveryMethod === "pickup" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
                    )}
                  </div>
                </button>

                {/* Opción 2: Envío a domicilio en Cipolletti (Gratis) */}
                <button
                  type="button"
                  onClick={() =>
                    handleChange("deliveryMethod", "shipping_cipo")
                  }
                  className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                    formData.deliveryMethod === "shipping_cipo"
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.15)]"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#131923] border border-slate-800 mt-0.5">
                      <Truck
                        className={`w-5 h-5 ${
                          formData.deliveryMethod === "shipping_cipo"
                            ? "text-[#00A8FF]"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Envío a domicilio en Cipolletti (Gratis)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                          Gratis
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Entrega a domicilio sin costo dentro del radio de
                        Cipolletti.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      formData.deliveryMethod === "shipping_cipo"
                        ? "border-[#00A8FF] bg-[#00A8FF]"
                        : "border-slate-700"
                    }`}
                  >
                    {formData.deliveryMethod === "shipping_cipo" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
                    )}
                  </div>
                </button>

                {/* Opción 3: Entrega fuera de Cipolletti (Sujeto a coordinación) */}
                <button
                  type="button"
                  onClick={() =>
                    handleChange("deliveryMethod", "shipping_other")
                  }
                  className={`w-full p-4 rounded-xl border text-left flex items-start justify-between gap-3 transition-all ${
                    formData.deliveryMethod === "shipping_other"
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.15)]"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-[#131923] border border-slate-800 mt-0.5">
                      <Truck
                        className={`w-5 h-5 ${
                          formData.deliveryMethod === "shipping_other"
                            ? "text-[#00A8FF]"
                            : "text-slate-400"
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          Entrega fuera de Cipolletti (Sujeto a coordinación)
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          A coordinar
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Disponible según cercanía/disponibilidad. Coordinamos
                        por WhatsApp si es viable la entrega y el costo del
                        envío.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-1 ${
                      formData.deliveryMethod === "shipping_other"
                        ? "border-[#00A8FF] bg-[#00A8FF]"
                        : "border-slate-700"
                    }`}
                  >
                    {formData.deliveryMethod === "shipping_other" && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
                    )}
                  </div>
                </button>
              </div>

              {/* Campos condicionales para Envío a domicilio en Cipolletti */}
              {formData.deliveryMethod === "shipping_cipo" && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Dirección en Cipolletti (Calle, Número, Piso/Depto){" "}
                      <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="Ej: España 450, Piso 2 B"
                      className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                        errors.address ? "border-red-500" : "border-slate-800"
                      } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                    />
                    {errors.address && (
                      <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>{errors.address}</span>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Campos condicionales para Entrega fuera de Cipolletti */}
              {formData.deliveryMethod === "shipping_other" && (
                <div className="pt-4 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Localidad / Barrio{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="Ej: Neuquén Capital, Plottier, Fernández Oro..."
                        className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                          errors.city ? "border-red-500" : "border-slate-800"
                        } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                      />
                      {errors.city && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.city}</span>
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Dirección aproximada o punto de referencia{" "}
                        <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) =>
                          handleChange("address", e.target.value)
                        }
                        placeholder="Ej: San Martín 500, o cerca de..."
                        className={`w-full px-4 py-3 rounded-xl bg-[#0B0E14] border ${
                          errors.address ? "border-red-500" : "border-slate-800"
                        } text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm`}
                      />
                      {errors.address && (
                        <p className="text-xs text-red-400 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.address}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>
                      Al enviar el pedido, coordinaremos por WhatsApp si es
                      factible la entrega en tu zona y el costo del envío.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Sección 3: Método de Pago */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-4 shadow-sm">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] text-xs font-mono font-bold">
                  3
                </span>
                <span>Método de Pago</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Opción Transferencia */}
                <button
                  type="button"
                  onClick={() => handleChange("paymentMethod", "transfer")}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    formData.paymentMethod === "transfer"
                      ? "bg-[#00A8FF]/10 border-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.15)]"
                      : "bg-[#0B0E14] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <CreditCard
                      className={`w-5 h-5 ${
                        formData.paymentMethod === "transfer"
                          ? "text-[#00A8FF]"
                          : "text-slate-400"
                      }`}
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        formData.paymentMethod === "transfer"
                          ? "border-[#00A8FF] bg-[#00A8FF]"
                          : "border-slate-700"
                      }`}
                    >
                      {formData.paymentMethod === "transfer" && (
                        <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-sm text-white block">
                      Transferencia / Efectivo
                    </span>
                    <span className="text-xs text-slate-400">
                      CBU / CVU inmediato o pago contra entrega
                    </span>
                  </div>
                </button>

                {/* Opción Mercado Pago (con restricción y recargo) */}
                <button
                  type="button"
                  disabled={isMercadoPagoDisabled}
                  onClick={() => {
                    if (!isMercadoPagoDisabled) {
                      handleChange("paymentMethod", "mercadopago");
                    }
                  }}
                  className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all ${
                    isMercadoPagoDisabled
                      ? "opacity-50 cursor-not-allowed pointer-events-none bg-slate-900/30 border-slate-800 text-slate-500"
                      : formData.paymentMethod === "mercadopago"
                        ? "bg-[#00A8FF]/10 border-[#00A8FF] shadow-[0_0_15px_rgba(0,168,255,0.15)]"
                        : "bg-[#0B0E14] border-slate-800 hover:border-slate-700 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <Wallet
                      className={`w-5 h-5 ${
                        isMercadoPagoDisabled
                          ? "text-slate-600"
                          : formData.paymentMethod === "mercadopago"
                            ? "text-[#00A8FF]"
                            : "text-slate-400"
                      }`}
                    />
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        formData.paymentMethod === "mercadopago" &&
                        !isMercadoPagoDisabled
                          ? "border-[#00A8FF] bg-[#00A8FF]"
                          : "border-slate-700"
                      }`}
                    >
                      {formData.paymentMethod === "mercadopago" &&
                        !isMercadoPagoDisabled && (
                          <div className="w-1.5 h-1.5 rounded-full bg-[#0B0E14]" />
                        )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-sm text-white block">
                        Mercado Pago
                      </span>
                      {isMercadoPagoDisabled ? (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          No disponible fuera de Cipolletti
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          +10% por costo de servicio/pasarela
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block">
                      {isMercadoPagoDisabled
                        ? "Solo disponible para envíos o retiro en Cipolletti"
                        : "Tarjetas de débito/crédito y saldo en cuenta"}
                    </span>
                  </div>
                </button>
              </div>
            </div>

            {/* Sección 4: Notas opcionales */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-3 shadow-sm">
              <label className="block text-xs font-semibold text-slate-300">
                Notas adicionales para el vendedor (opcional)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Ej: Timbre no funciona, dejar con el portero, horario preferido de entrega..."
                className="w-full px-4 py-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm resize-none"
              />
            </div>
          </div>

          {/* Columna Derecha: Resumen del Pedido (5 columnas) */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
            <div className="p-6 sm:p-7 rounded-2xl bg-[#131923] border border-slate-800 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <h3 className="text-lg font-bold text-white">
                  Resumen del Pedido
                </h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/20">
                  {items.length} {items.length === 1 ? "ítem" : "ítems"}
                </span>
              </div>

              {/* Lista compacta de productos */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 divide-y divide-slate-800/60">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3.5 pt-3 first:pt-0"
                  >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-[#0B0E14] border border-slate-800 shrink-0">
                      {item.product.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.title}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#131923] text-slate-500">
                          <Smartphone className="w-5 h-5 text-[#00A8FF]/60" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                          {item.product.title}
                        </h4>
                        {(!item.product.is_active ||
                          item.product.stock <= 0) && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
                            Sin stock
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                        <span>Cant: {item.quantity}</span>
                        <span className="font-semibold text-white">
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales y Desglose */}
              <div className="space-y-2 pt-4 border-t border-slate-800/80 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-white">
                    {formatCurrency(totalPrice)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span>Envío</span>
                  <span
                    className={`font-semibold ${
                      formData.deliveryMethod === "shipping_other"
                        ? "text-amber-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formData.deliveryMethod === "shipping_other"
                      ? "A coordinar por WhatsApp"
                      : "Gratis"}
                  </span>
                </div>

                {/* Recargo Mercado Pago (10%) */}
                {formData.paymentMethod === "mercadopago" && (
                  <div className="flex items-center justify-between text-amber-300 font-medium animate-in fade-in duration-200">
                    <span>Recargo Mercado Pago (10%)</span>
                    <span>+{formatCurrency(surchargeAmount)}</span>
                  </div>
                )}

                <div className="flex items-baseline justify-between pt-3 border-t border-slate-800/80 text-base">
                  <span className="font-bold text-white">Total a pagar</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formatCurrency(finalTotal)}
                  </span>
                </div>
              </div>

              {/* Mensaje de error visual si falla Mercado Pago */}
              {mpError && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <span className="font-bold block">
                      Error al procesar pago
                    </span>
                    <span>{mpError}</span>
                  </div>
                </div>
              )}

              {/* Alerta de productos sin stock */}
              {hasOutOfStockItems && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">
                      Productos sin stock en el pedido
                    </span>
                    <span>
                      Algunos accesorios de tu pedido ya no cuentan con stock
                      disponible. Por favor, modificalos en tu carrito para
                      poder continuar.
                    </span>
                  </div>
                </div>
              )}

              {/* Botón de Acción Principal */}
              <div>
                {formData.paymentMethod === "transfer" ? (
                  <button
                    type="button"
                    onClick={handleTransferSubmit}
                    disabled={hasOutOfStockItems}
                    className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_25px_rgba(37,211,102,0.3)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>
                      {hasOutOfStockItems
                        ? "No disponible (Productos sin stock)"
                        : "Confirmar y Enviar Pedido por WhatsApp"}
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleMercadoPagoSubmit}
                    disabled={
                      isProcessing ||
                      isMercadoPagoDisabled ||
                      hasOutOfStockItems
                    }
                    className="w-full py-4 px-4 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_25px_rgba(0,168,255,0.3)] hover:shadow-[0_0_30px_rgba(0,168,255,0.5)] flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    <Wallet className="w-5 h-5" />
                    <span>
                      {hasOutOfStockItems
                        ? "No disponible (Productos sin stock)"
                        : isProcessing
                          ? "Conectando con Mercado Pago..."
                          : `Pagar ${formatCurrency(finalTotal)} con Mercado Pago`}
                    </span>
                  </button>
                )}
              </div>

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center pt-1">
                <ShieldCheck className="w-4 h-4 text-[#00A8FF]" />
                <span>Compra protegida y directa con Nexxo Tech</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
