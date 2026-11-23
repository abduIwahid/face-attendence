import { ShieldCheck } from "lucide-react";
import ClassLocationSettings from "../../../components/ClassLocationSettings";

/**
 * Full class settings page (Phase 3 — BUILD_PLAN "Teacher settings page
 * (location + radius)"). Hosts the same ClassLocationSettings control the
 * dashboard carries, so both surfaces always agree; saving here updates
 * the single class_settings row the verify flow checks against.
 */
export default function TeacherSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Teacher dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
          Class settings
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-secondary">
          The class location and radius decide every attendance check. Set
          them while standing in the classroom — students can only be marked
          present inside the radius.
        </p>
      </div>

      <ClassLocationSettings />

      <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
          <ShieldCheck className="h-5 w-5 text-accent-strong" aria-hidden />
          How the check uses these settings
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-secondary">
          <li>
            The student&apos;s phone samples its GPS for a few seconds and
            sends its most accurate fix — a single indoor reading can drift
            by 100 m or more.
          </li>
          <li>
            The server measures the distance from that fix to the class
            location and allows for the phone&apos;s own reported accuracy
            before deciding the student is too far.
          </li>
          <li>
            A fix rougher than ±250 m is rejected outright — it cannot prove
            where anyone is.
          </li>
          <li>
            The raw distance and accuracy are stored on every attendance row,
            so a marginal pass in the log can always be questioned.
          </li>
        </ul>
      </section>
    </div>
  );
}
