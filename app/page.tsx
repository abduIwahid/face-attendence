export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-md">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Phase 0 — Setup
        </p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-primary">
          Face Attendance System
        </h1>
        <p className="mt-3 text-base leading-relaxed text-secondary">
          Attendance by live selfie and live GPS radius. Your face must match
          your registered photo <strong>and</strong> your phone must be inside
          the class radius — otherwise no attendance.
        </p>
        <div className="mt-6 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent-strong">
          Setup complete. Registration and verification arrive in the next
          phases.
        </div>
      </div>
    </main>
  );
}
