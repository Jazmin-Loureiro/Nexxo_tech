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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand & Título */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 group transition-transform active:scale-95"
            >
              <div className="w-8 h-8 rounded-lg bg-[#131923] border border-slate-800 flex items-center justify-center text-[#00A8FF] group-hover:border-[#00A8FF]/50 transition-colors">
                <Shield className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                NEXXO<span className="text-[#00A8FF]">_TECH</span>
              </span>
            </Link>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#00A8FF]/10 text-[#00A8FF] border border-[#00A8FF]/30">
              ADMIN
            </span>
          </div>

          {/* Acciones del Administrador */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Indicador de Usuario */}
            {userEmail && (
              <span className="hidden md:inline-block text-xs text-slate-400 font-mono truncate max-w-[200px]">
                {userEmail}
              </span>
            )}

            {/* Enlace directo a la tienda pública */}
            <Link
              href="/catalogo"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#131923] hover:bg-slate-800 border border-slate-800 transition-colors"
            >
              <span>Ver Catálogo</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </Link>

            {/* Botón de Cerrar Sesión */}
            <button
              type="button"
              disabled={isLoggingOut}
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 transition-all cursor-pointer disabled:opacity-50"
              title="Cerrar sesión"
            >
              {isLoggingOut ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <LogOut className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
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
