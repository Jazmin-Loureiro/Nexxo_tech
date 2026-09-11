"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Lock,
  Mail,
  Loader2,
  AlertCircle,
  ArrowRight,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Por favor, ingresá tu email y contraseña.");
      return;
    }

    try {
      setIsLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          setErrorMessage("Email o contraseña incorrectos.");
        } else {
          setErrorMessage(error.message || "Error al iniciar sesión.");
        }
        setIsLoading(false);
        return;
      }

      // Redirigir al dashboard administrativo y refrescar el router
      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      console.error("Error en login:", err);
      setErrorMessage(
        err?.message ||
          "Ocurrió un error inesperado al conectar con el servidor.",
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Luces de fondo decorativas */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#00A8FF]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Cabecera de Marca */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#131923] border border-slate-800 text-[#00A8FF] mb-4">
            <Shield className="w-3.5 h-3.5 text-[#00A8FF]" />
            <span className="font-mono tracking-wider">PANEL DE CONTROL</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            NEXXO<span className="text-[#00A8FF]">_TECH</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Acceso exclusivo para administración y gestión de stock.
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[#131923] border border-slate-800 shadow-2xl backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mensaje de Error */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400 flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Campo Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  disabled={isLoading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nexxotech.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  disabled={isLoading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#0B0E14] border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-[#00A8FF] transition-colors text-sm disabled:opacity-50"
                />
              </div>
            </div>

            {/* Botón de Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-[#00A8FF] hover:bg-[#38bdf8] text-[#0B0E14] shadow-[0_0_20px_rgba(0,168,255,0.3)] hover:shadow-[0_0_25px_rgba(0,168,255,0.45)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#0B0E14]" />
                  <span>Iniciando sesión...</span>
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800 text-center">
            <Link
              href="/catalogo"
              className="text-xs text-slate-400 hover:text-[#00A8FF] transition-colors"
            >
              ← Volver a la tienda pública
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
