import Link from "next/link";
import AttendanceLog from "../../components/AttendanceLog";
import ClassLocationSettings from "../../components/ClassLocationSettings";
import StudentsList from "../../components/StudentsList";

/**
 * Teacher dashboard (Phase 3): the attendance log with date filter + Excel
 * export, the registered-students list with the ETHICS_PRIVACY deletion
 * path, and the class-location control. The session check lives in
 * `app/teacher/layout.tsx`; the full settings page is /teacher/settings.
 */
export default function TeacherPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent-strong">
          Teacher dashboard
        </p>
        <h1 className="mt-2 text-3xl font-bold leading-tight text-primary">
          Attendance, at a glance
        </h1>
        <p className="mt-2 max-w-xl text-base leading-relaxed text-secondary">
          Review the day&apos;s attempts, export the log to Excel, and manage
          the class. Students mark attendance from the{" "}
          <Link href="/verify" className="font-semibold text-accent-strong underline">
            Mark attendance
          </Link>{" "}
          page after{" "}
          <Link href="/register" className="font-semibold text-accent-strong underline">
            registering
          </Link>
          .
        </p>
      </div>

      <AttendanceLog />
      <StudentsList />
      <ClassLocationSettings />

      <p className="text-sm text-secondary">
        The same class location and radius can also be managed on the{" "}
        <Link
          href="/teacher/settings"
          className="font-semibold text-accent-strong underline"
        >
          Class settings
        </Link>{" "}
        page.
      </p>
    </div>
  );
}
