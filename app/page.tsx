import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Phase 1 — Foundation
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-primary">
          Face Attendance System
        </h1>
        <p className="mt-3 text-base leading-relaxed text-secondary">
          Attendance by live selfie and live GPS radius. Your face must match
          your registered photo <strong>and</strong> your phone must be inside
          the class radius — otherwise no attendance.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          <Link
            href="/register"
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 text-base font-semibold text-white transition-colors hover:bg-accent-strong"
          >
            Register your face
          </Link>
          <Link
            href="/teacher"
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
          >
            Teacher sign-in
          </Link>
        </div>
        <p className="mt-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-strong">
          Foundation is in place: database schema, teacher sign-in and the
          registration page. Live face capture arrives in Phase 2.
        </p>
      </div>
    </main>
  );
}
