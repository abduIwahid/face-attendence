import { ClipboardList, Users } from "lucide-react";
import Link from "next/link";
import ClassLocationSettings from "../../components/ClassLocationSettings";

/**
 * Teacher dashboard. The session check lives in `app/teacher/layout.tsx`;
 * this page renders the overview cards plus the class-location control
 * (Phase 2 — the verify flow cannot run until a class location exists;
 * the full log table and settings page arrive in Phase 3).
 */
const cards = [
  {
    icon: Users,
    title: "Students",
    empty: "Registration is open.",
    action: "Students register themselves from the Register page — their faces are stored as descriptors, never as public photos.",
  },
  {
    icon: ClipboardList,
    title: "Attendance",
    empty: "No log view yet.",
    action: "Attendance rows are being recorded by the verify flow. The log table + Excel export arrive in Phase 3.",
  },
];

export default function TeacherPage() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
        Phase 2 — Core feature
      </p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
        Teacher Dashboard
      </h1>
      <p className="mt-2 max-w-xl text-base leading-relaxed text-secondary">
        You are signed in. Set the class location below first — students can
        only mark attendance inside its radius.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
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

      <div className="mt-4">
        <ClassLocationSettings />
      </div>

      <p className="mt-8 text-sm text-secondary">
        Student pages:{" "}
        <Link href="/register" className="font-semibold text-accent-strong underline">
          Register
        </Link>{" "}
        ·{" "}
        <Link href="/verify" className="font-semibold text-accent-strong underline">
          Mark attendance
        </Link>
        .
      </p>
    </div>
  );
}
