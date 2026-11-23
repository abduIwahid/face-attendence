import { ClipboardList, Settings, Users } from "lucide-react";
import Link from "next/link";

/**
 * Teacher dashboard — Phase 1 placeholder. The session check lives in
 * `app/teacher/layout.tsx`; this page only renders the (currently empty)
 * overview cards. Real data arrives with the Phase 2/3 features.
 */
const cards = [
  {
    icon: Users,
    title: "Students",
    empty: "No students registered yet.",
    action: "Registration opens in Phase 2.",
  },
  {
    icon: ClipboardList,
    title: "Attendance",
    empty: "No attendance recorded yet.",
    action: "Rows appear here after the first verification.",
  },
  {
    icon: Settings,
    title: "Class settings",
    empty: "No class location set yet.",
    action: "Location and radius become editable in Phase 3.",
  },
];

export default function TeacherPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
        Phase 1 — Foundation
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
        Teacher Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-secondary">
        You are signed in. Student registration, the attendance log and class
        settings will appear here as the next phases land.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <section
            key={card.title}
            className="rounded-xl border border-border bg-surface p-6 shadow-sm"
          >
            <card.icon className="h-6 w-6 text-accent-strong" aria-hidden />
            <h2 className="mt-3 text-lg font-semibold text-primary">{card.title}</h2>
            <p className="mt-1 text-sm text-secondary">{card.empty}</p>
            <p className="mt-3 text-sm font-medium text-accent-strong">{card.action}</p>
          </section>
        ))}
      </div>

      <p className="mt-8 text-sm text-secondary">
        Looking for student check-in?{" "}
        <Link href="/register" className="font-semibold text-accent-strong underline">
          Open the registration page
        </Link>
        .
      </p>
    </div>
  );
}
