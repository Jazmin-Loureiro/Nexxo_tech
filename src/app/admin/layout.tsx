"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  ExternalLink,
  LogOut,
  Package,
  Layers,
  Shield,
  Loader2,
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Si estamos en /admin/login, no mostrar el layout de administración con header
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) return;

    const supabase = createClient();
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user?.email) {
        setUserEmail(data.user.email);
      }
    };
    loadUser();
  }, [isLoginPage]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/admin/login");
      router.refresh();
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#0B0E14] text-slate-100 flex flex-col selection:bg-[#00A8FF]/30">
      {/* Barra de Navegación Superior del Admin */}
      <header className="sticky top-0 z-40 w-full bg-[#0B0E14]/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Fila 1 (Mobile) / Barra unificada (Desktop) */}
          <div className="h-16 flex items-center justify-between gap-3">
            {/* Brand & Título */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 group transition-transform active:scale-95 shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-[#131923] border border-slate-800 flex items-center justify-center text-[#00A8FF] group-hover:border-[#00A8FF]/50 transition-colors">
                  <Shield className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-base tracking-tight text-white whitespace-nowrap">
                  NEXXO<span className="text-[#00A8FF]">_TECH</span>
                </span>
              </Link>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/30">
                ADMIN
              </span>

              {/* Navegación interna Desktop (>= 768px) */}
              <nav className="hidden md:flex items-center gap-1 sm:ml-2">
                <Link
                  href="/admin"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    pathname === "/admin" ||
                    pathname === "/admin/nuevo" ||
                    (pathname.startsWith("/admin/") &&
                      !pathname.startsWith("/admin/pedidos"))
                      ? "bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Productos
                </Link>
                <Link
                  href="/admin/pedidos"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    pathname.startsWith("/admin/pedidos")
                      ? "bg-[#00A8FF]/15 text-[#00A8FF] border border-[#00A8FF]/30"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  Pedidos
                </Link>
              </nav>
            </div>

            {/* Acciones del Administrador */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* Indicador de Usuario */}
              {userEmail && (
                <span className="hidden lg:inline-block text-xs text-slate-400 font-mono truncate max-w-[180px]">
                  {userEmail}
                </span>
              )}

              {/* Enlace directo a la tienda pública */}
              <Link
                href="/catalogo"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#131923] hover:bg-slate-800 border border-slate-800 transition-colors whitespace-nowrap"
              >
                <span>Ver Catálogo</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </Link>

              {/* Botón de Cerrar Sesión */}
              <button
                type="button"
                disabled={isLoggingOut}
                onClick={handleSignOut}
                className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                title="Cerrar sesión"
              >
                {isLoggingOut ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                ) : (
                  <LogOut className="w-3.5 h-3.5 shrink-0" />
                )}
                <span className="hidden sm:inline">Cerrar sesión</span>
              </button>
            </div>
          </div>

          {/* Fila 2: Pestañas de Navegación en Mobile (< 768px) */}
          <div className="md:hidden pb-3 pt-1 border-t border-slate-800/60">
            <nav className="w-full grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#131923] border border-slate-800">
              <Link
                href="/admin"
                className={`py-2 rounded-lg text-xs font-bold text-center transition-all ${
                  pathname === "/admin" ||
                  pathname === "/admin/nuevo" ||
                  (pathname.startsWith("/admin/") &&
                    !pathname.startsWith("/admin/pedidos"))
                    ? "bg-[#00A8FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,168,255,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Productos
              </Link>
              <Link
                href="/admin/pedidos"
                className={`py-2 rounded-lg text-xs font-bold text-center transition-all ${
                  pathname.startsWith("/admin/pedidos")
                    ? "bg-[#00A8FF] text-[#0B0E14] shadow-[0_0_12px_rgba(0,168,255,0.25)]"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Pedidos
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
