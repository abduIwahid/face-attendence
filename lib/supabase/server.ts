import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client (Server Components, Route Handlers, Server Actions).
 * Cookie-based session — used to check the teacher's session server-side on
 * every teacher request (brain/SECURITY.md sweep #1). Runs as the signed-in
 * user (anon key + session), so RLS applies. For service-role access use
 * `lib/supabase/admin.ts` — never this client.
 */
export async function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
  const cookieStore = await cookies();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — cookie writes are handled by
          // middleware.ts session refresh instead. Safe to ignore.
        }
      },
    },
  });
}
