import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * SERVER-ONLY service-role client. Bypasses RLS by design — this is the
 * client the API routes use for student register/verify and teacher log
 * reads (brain/DATA_MODEL.md: the browser never queries the tables).
 *
 * NEVER import this file from client code: the service-role key must never
 * reach a browser bundle (brain/SECURITY.md sweep #3).
 */
export function createAdminClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "placeholder-service-role-key";
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
