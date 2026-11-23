import Link from "next/link";
import BrandMark from "./BrandMark";

/**
 * Slim header for the student flows (/register, /verify) — the Aurora
 * landing nav reduced to what those pages need: the mark, and the way
 * back to the teacher sign-in. Presentation only; the pages own their
 * logic.
 */
export default function SiteHeader() {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <BrandMark />
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-accent-strong outline-none transition-colors hover:bg-accent-soft focus-visible:ring-2 focus-visible:ring-accent"
        >
          Teacher sign-in
        </Link>
      </div>
    </header>
  );
}
