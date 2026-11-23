import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client — anon key only.
 * Safe in the browser ONLY because RLS is on and the anon role has no
 * policies on any table (brain/SECURITY.md sweep #3): this client can
 * run Auth (teacher sign-in) but can never read `students`/`attendance`.
 * Student data always moves through Next.js API routes (service role).
 *
 * Env fallbacks keep local builds/renders from crashing while `.env.local`
 * still carries placeholder key values (see brain/changes/current-state.md).
 */
export function createClient() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key";
  return createBrowserClient(url, anonKey);
}
