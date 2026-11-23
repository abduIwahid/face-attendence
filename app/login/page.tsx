"use client";

import { CheckCircle2, Eye, EyeOff, Lock, MapPin, ScanFace } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BrandMark from "@/components/BrandMark";
import FloatingInput from "@/components/FloatingInput";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation";

/**
 * Teacher sign-in — Aurora's split-screen auth layout (ADR-011; library:
 * authentication/default/jwt/login + the browser-observed layout note).
 * Left: branding panel with the product mark and the attendance-check
 * visual. Right: an open form column (no card) — heading, filled inputs
 * with floating labels, full-width blue primary button. The Aurora demo
 * pieces that map to nothing real here (social buttons, demo-credentials
 * box, public sign-up) are deliberately absent: teacher accounts are
 * created by the admin, and the "no account?" line points students at the
 * flow that actually applies to them. Auth logic unchanged.
 */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check the form and try again.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    setLoading(false);

    if (signInError) {
      setError("Sign-in failed. Check your email and password and try again.");
      return;
    }
    router.push("/teacher");
    router.refresh();
  }

  return (
    <main className="grid flex-1 lg:grid-cols-2">
      {/* Branding panel (left) */}
      <aside className="relative hidden flex-col border-r border-border bg-surface-muted px-10 py-8 lg:flex">
        <BrandMark />
        <div className="flex flex-1 flex-col items-center justify-center gap-8 py-10">
          <div className="max-w-sm text-center">
            <h2 className="text-2xl font-bold leading-snug text-primary">
              The right person, in the right place.
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-secondary">
              Every attendance record in your log was decided by two checks —
              a live face match and a live location check, re-verified on the
              server.
            </p>
          </div>
          {/* The double check, shown as the product shows it */}
          <div className="w-full max-w-sm rounded-xl border border-border bg-surface p-5 shadow-md">
            <p className="flex items-center gap-2 text-sm font-bold text-primary">
              <ScanFace className="h-5 w-5 text-accent-strong" aria-hidden />
              Attendance check
            </p>
            <ul className="mt-4 flex flex-col gap-3.5">
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-sm text-primary">
                  <ScanFace className="h-5 w-5 text-secondary" aria-hidden />
                  Face match
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs font-semibold text-success-strong">
                  <CheckCircle2 className="h-4 w-4" aria-hidden />
                  Matched
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-sm text-primary">
                  <MapPin className="h-5 w-5 text-secondary" aria-hidden />
                  Location
                </span>
                <span className="text-xs font-medium text-secondary">
                  Inside the class radius
                </span>
              </li>
              <li className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2.5 text-sm text-primary">
                  <Lock className="h-5 w-5 text-secondary" aria-hidden />
                  Server re-check
                </span>
                <span className="text-xs font-medium text-secondary">
                  Verified again, server-side
                </span>
              </li>
            </ul>
            <div className="mt-5 rounded-lg bg-success px-4 py-2.5 text-center text-sm font-bold tracking-wide text-white">
              PRESENT
            </div>
          </div>
        </div>
        <p className="text-center text-xs text-secondary">
          Teacher accounts are created by the school admin. Students never
          need an account.
        </p>
      </aside>

      {/* Form column (right) */}
      <section className="flex items-center justify-center px-4 py-12 sm:px-6">
        <div className="animate-rise w-full max-w-md">
          <div className="lg:hidden">
            <BrandMark />
          </div>
          <div className="mt-8 flex flex-wrap items-end justify-between gap-2 lg:mt-0">
            <h1 className="text-3xl font-bold leading-tight text-primary">
              Log in
            </h1>
            <p className="text-sm text-secondary">
              Student?{" "}
              <Link
                href="/verify"
                className="font-semibold text-accent-strong hover:underline"
              >
                Mark attendance
              </Link>
            </p>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-secondary">
            Sign in to view the attendance log and class settings. Student
            registration and verification do not need an account.
          </p>

          <form onSubmit={handleSubmit} className="mt-7 flex flex-col gap-4" noValidate>
            <FloatingInput
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <FloatingInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              endAdornment={
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="flex h-11 w-11 items-center justify-center rounded-lg text-secondary outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-accent"
                >
                  {showPassword ? (
                    <Eye className="h-5 w-5" aria-hidden />
                  ) : (
                    <EyeOff className="h-5 w-5" aria-hidden />
                  )}
                </button>
              }
            />

            {error ? (
              <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="min-h-11 rounded-lg bg-accent px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-accent-strong disabled:bg-surface-muted disabled:text-secondary disabled:shadow-none"
            >
              {loading ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-10 text-center text-sm text-secondary">
            Trouble signing in? Ask the school admin to reset your password —
            accounts are managed by the admin, not self-registered.
          </p>
        </div>
      </section>
    </main>
  );
}
