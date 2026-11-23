"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/teacher", label: "Dashboard" },
  { href: "/teacher/settings", label: "Class settings" },
];

/**
 * Teacher-area navigation (brain/DESIGN.md Nav states: default / active =
 * accent text + 2px underline / focus-visible ring).
 */
export default function TeacherNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Teacher" className="flex items-center gap-1">
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "inline-flex min-h-11 items-center border-b-2 border-accent px-3 text-sm font-semibold text-accent-strong outline-none focus-visible:ring-2 focus-visible:ring-accent"
                : "inline-flex min-h-11 items-center border-b-2 border-transparent px-3 text-sm font-medium text-secondary transition-colors hover:text-primary outline-none focus-visible:ring-2 focus-visible:ring-accent"
            }
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
