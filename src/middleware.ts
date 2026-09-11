import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Obtener usuario autenticado validado con el servidor de Supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Si no está autenticado e intenta acceder a cualquier ruta /admin/* (excepto login)
  if (!user && pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  // Si está autenticado e intenta ingresar a /admin/login, redirigir al panel
  if (user && pathname === "/admin/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}

// Configurar el matcher exclusivo para rutas del panel de administración
export const config = {
  matcher: ["/admin/:path*"],
};
