import { Metadata } from "next";
import {
  MapPin,
  Clock,
  MessageCircle,
  Truck,
  Sparkles,
  CheckCircle2,
  Phone,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto & Zonas de Entrega | Nexxo Tech",
  description:
    "Comunicate con Nexxo Tech. Conocé nuestras zonas de entrega en Cipolletti y alrededores, horarios de atención y canales de contacto directo por WhatsApp e Instagram.",
};

export default function ContactoPage() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    "¡Hola Nexxo Tech! Me gustaría consultar por zonas de entrega y stock disponible.",
  )}`;

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 py-12 sm:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Encabezado */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span className="font-mono uppercase tracking-wider">
              Atención Directa
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Contacto & Envíos
          </h1>
          <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
            Estamos en Cipolletti para brindarte la mejor experiencia en
            accesorios de celular. Escribinos directamente ante cualquier duda.
          </p>
        </div>

        {/* Tarjetas Principales: Zonas de Entrega & Horarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Zonas de Entrega */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mb-6 text-[#00A8FF]">
                <MapPin className="w-6 h-6" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Zonas de Entrega
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Coordinamos envíos personalizados y puntos de encuentro
                estratégicos en todo el Alto Valle:
              </p>

              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8FF] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">
                      Cipolletti:
                    </span>{" "}
                    <span className="text-slate-400">
                      Entregas en el día o en 24 hs en todos los barrios.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8FF] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">
                      Neuquén Capital:
                    </span>{" "}
                    <span className="text-slate-400">
                      Coordinación directa de entrega express.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8FF] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Plottier:</span>{" "}
                    <span className="text-slate-400">
                      Envíos programados a domicilio o punto céntrico.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#00A8FF] mt-0.5 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">
                      Centenario:
                    </span>{" "}
                    <span className="text-slate-400">
                      Envíos coordinados con tarifa accesible.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center gap-2 text-xs text-[#00A8FF] font-medium">
              <Truck className="w-4 h-4" />
              <span>Embalaje seguro y testeado antes de la entrega</span>
            </div>
          </div>

          {/* Horarios de Atención */}
          <div className="p-6 sm:p-8 rounded-2xl bg-[#131923] border border-slate-800 hover:border-[#00A8FF]/30 transition-colors flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-[#00A8FF]/10 border border-[#00A8FF]/20 flex items-center justify-center mb-6 text-[#00A8FF]">
                <Clock className="w-6 h-6" />
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Horarios de Atención
              </h2>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Respondemos tus mensajes y procesamos despachos durante toda la
                semana:
              </p>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Lunes a Sábados
                    </span>
                    <span className="text-xs text-slate-400">
                      Atención continua y entregas
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-[#00A8FF]">
                    09:00 - 20:00 hs
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-[#0B0E14] border border-slate-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-sm font-bold text-white block">
                      Domingos y Feriados
                    </span>
                    <span className="text-xs text-slate-400">
                      Consultas por WhatsApp
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400">
                    Guardia Activa
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Tiempo de respuesta promedio: menos de 15 minutos</span>
            </div>
          </div>
        </div>

        {/* Canales de Contacto Directos */}
        <div className="p-6 sm:p-10 rounded-2xl bg-[#131923] border border-slate-800 text-center space-y-6">
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              Canales Directos de Comunicación
            </h3>
            <p className="text-sm text-slate-400">
              Elegí tu canal preferido para hacer consultas, solicitar fotos o
              confirmar tu pedido.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            {/* Botón WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-[0_0_25px_rgba(37,211,102,0.35)] hover:shadow-[0_0_30px_rgba(37,211,102,0.5)] transition-all active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span>Escribir por WhatsApp</span>
            </a>

            {/* Botón Instagram */}
            <a
              href="https://instagram.com/nexxotech"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-sm bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-95 text-white shadow-[0_0_25px_rgba(253,29,29,0.25)] transition-all active:scale-[0.98]"
            >
              {/* Ícono oficial vectorial de Instagram */}
              <svg
                className="w-5 h-5 fill-current"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
              <span>Seguinos en Instagram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
