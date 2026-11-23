import { redirect } from "next/navigation";
import LogoutButton from "@/components/LogoutButton";
import { createClient } from "@/lib/supabase/server";

// Auth state is per-request runtime data — this segment must never prerender.
export const instant = false;

/**
 * Teacher-area guard: every /teacher page sits behind this layout, which
 * checks the Supabase session server-side on each request and redirects
 * signed-out visitors to /login (brain/SECURITY.md sweep #1 — no security
 * by URL obscurity). RLS is the second wall.
 */
export default async function TeacherLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <div>
            <p className="text-sm font-bold text-primary">Teacher Dashboard</p>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
