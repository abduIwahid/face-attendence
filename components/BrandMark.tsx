import { ScanFace } from "lucide-react";
import Link from "next/link";

/**
 * The product mark, one treatment everywhere (Aurora-style: a rounded
 * accent tile + wordmark). Used by the landing nav, the auth branding
 * panel, the student-flow header and the teacher sidenav.
 */
export default function BrandMark({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <Link
      href="/"
      className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-accent"
      aria-label="Face Attendance — home"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent text-white shadow-sm">
        <ScanFace className="h-6 w-6" aria-hidden />
      </span>
      {!compact ? (
        <span className="text-base font-bold leading-tight text-primary">
          Face Attendance
          <span className="block text-xs font-medium text-secondary">
            Face + location verified
          </span>
        </span>
      ) : null}
    </Link>
  );
}
