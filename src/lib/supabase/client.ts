import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Retorna una instancia compartida (singleton) de Supabase en el navegador
 * configurada con @supabase/ssr para garantizar persistencia y sincronización
 * de la sesión activa entre todos los Client Components.
 */
export function createClient() {
  if (typeof window === "undefined") {
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    );
  }

  return client;
}
