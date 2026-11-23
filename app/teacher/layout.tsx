import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import LogoutButton from "@/components/LogoutButton";
import TeacherNav from "@/components/TeacherNav";
import { createClient } from "@/lib/supabase/server";

// Auth state is per-request runtime data — this segment must never prerender.
export const instant = false;

/**
 * Teacher-area guard + Aurora app shell (ADR-011; library: the dashboard
 * pages share one sidenav/topnav chrome). Every /teacher page sits behind
 * this layout, which checks the Supabase session server-side on each
 * request and redirects signed-out visitors to /login (brain/SECURITY.md
 * sweep #1 — no security by URL obscurity). RLS is the second wall.
 * Shell: sidenav on desktop, top bar + nav row on smaller screens.
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
    <div className="flex flex-1 flex-col lg:flex-row">
      {/* Sidenav (desktop) */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border bg-surface px-4 py-5 lg:flex">
        <BrandMark />
        <div className="mt-8 flex-1">
          <TeacherNav orientation="vertical" />
        </div>
        <div className="border-t border-border pt-4">
          <p className="px-2 text-xs font-medium text-secondary">Signed in as</p>
          <p className="truncate px-2 text-sm font-semibold text-primary">
            {user.email}
          </p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top bar (mobile / tablet) */}
        <header className="border-b border-border bg-surface lg:hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <BrandMark />
            <LogoutButton />
          </div>
          <div className="px-4 pb-3 sm:px-6">
            <TeacherNav orientation="horizontal" />
          </div>
        </header>

        {/* Top bar (desktop) */}
        <header className="hidden items-center justify-between border-b border-border bg-surface px-6 py-4 lg:flex xl:px-10">
          <p className="text-sm font-bold text-primary">Teacher area</p>
          <p className="text-sm text-secondary">{user.email}</p>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-6 xl:px-10">
          {children}
        </main>
      </div>
    </div>
  );
}
