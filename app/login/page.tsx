"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/validation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    <main className="flex flex-1 items-center justify-center px-6 py-16">
      <div className="animate-rise w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Teacher sign-in
        </p>
        <h1 className="mt-3 text-2xl font-bold leading-tight text-primary">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-secondary">
          Sign in to view the attendance log and class settings. Student
          registration and verification do not need an account.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-primary">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
              placeholder="you@example.com"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-sm font-medium text-primary">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
              placeholder="Your password"
            />
          </div>

          {error ? (
            <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="min-h-11 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:bg-surface-muted disabled:text-secondary"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
