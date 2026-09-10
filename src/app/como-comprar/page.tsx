import { Metadata } from "next";
import Link from "next/link";
import {
  ShoppingBag,
  CreditCard,
  Truck,
  MessageCircle,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "¿Cómo Comprar? | Nexxo Tech",
  description:
    "Guía paso a paso para comprar accesorios de celular en Nexxo Tech: elegís tu producto, pagás seguro y coordinamos envío express en Neuquén por WhatsApp.",
};

const STEPS = [
  {
    step: "01",
    icon: ShoppingBag,
    title: "Elegí tu producto",
    description:
      "Explorá nuestro catálogo online con especificaciones técnicas detalladas, stock real y precios actualizados en pesos argentinos.",
    detail: "Agregá todo lo que necesites al carrito con un solo clic.",
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Pagá de forma segura",
    description:
      "Aceptamos pagos directos mediante Mercado Pago (todas las tarjetas y dinero en cuenta) o Transferencia Bancaria (CBU/CVU) inmediata.",
    detail: "Transacciones transparentes, rápidas y protegidas.",
  },
  {
    step: "03",
    icon: Truck,
    title: "Coordinamos entrega en Neuquén",
    description:
      "Te escribimos al instante por WhatsApp para definir la entrega express en tu domicilio o pactar un punto de retiro acordado en la zona.",
    detail: "Entregas en Neuquén Capital, Plottier, Cipolletti y Centenario.",
  },
];

const FAQS = [
  {
    question: "¿Cuánto tarda la entrega en Neuquén?",
    answer:
      "Si el producto está en stock, coordinamos entregas en el día o en un plazo máximo de 24 horas hábiles según tu zona y disponibilidad horaria.",
  },
  {
    question: "¿Los accesorios tienen garantía?",
    answer:
      "Sí, todos nuestros productos cuentan con garantía de funcionamiento ante cualquier falla de fábrica.",
  },
  {
    question:
      "¿Qué pasa si tengo dudas sobre la compatibilidad de mi teléfono?",
    answer:
      "Podés escribirnos directamente por WhatsApp indicando el modelo exacto de tu celular (iPhone, Samsung, Xiaomi, Motorola, etc.) y te asesoramos al instante.",
  },
];

export default function ComoComprarPage() {
  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Encabezado */}
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-4">
            <span className="font-mono uppercase tracking-wider">
              Proceso Simple y Transparente
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            ¿Cómo comprar en <span className="text-[#00A8FF]">Nexxo Tech</span>?
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-4 leading-relaxed">
            Comprar tus accesorios nunca fue tan fácil y seguro. En tres simples
            pasos tenés tu pedido en camino.
          </p>
        </div>

        {/* Paso a Paso */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {STEPS.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/40 transition-all duration-300 shadow-[0_0_20px_rgba(0,0,0,0.3)] group"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/25 flex items-center justify-center text-[#00A8FF] group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black font-mono text-slate-700 group-hover:text-[#00A8FF]/60 transition-colors">
                      {item.step}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#00A8FF] transition-colors">
                    {item.title}
                  </h3>

                  <p className="text-sm text-slate-400 leading-relaxed mb-4">
                    {item.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-slate-300 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8FF] shrink-0" />
                  <span>{item.detail}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preguntas Frecuentes */}
        <div className="p-6 sm:p-10 rounded-2xl bg-[#131923] border border-slate-800 space-y-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-[#00A8FF]" />
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              Preguntas Frecuentes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
            {FAQS.map((faq, i) => (
              <div key={i} className="space-y-2">
                <h4 className="text-sm font-bold text-slate-200">
                  {faq.question}
                </h4>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action Final */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.3)] transition-all active:scale-[0.98]"
          >
            <span>Ver Catálogo de Productos</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <a
            href="https://wa.me/5492990000000?text=Hola%20Nexxo%20Tech,%20tengo%20una%20duda%20antes%20de%20comprar..."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-sm bg-[#131923] hover:bg-[#1a2332] text-slate-200 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-[#25D366]" />
            <span>Consultar por WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
