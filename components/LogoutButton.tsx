"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted disabled:text-secondary"
    >
      <LogOut className="h-4 w-4" aria-hidden />
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
