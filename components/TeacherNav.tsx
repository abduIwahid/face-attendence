"use client";

import { LayoutDashboard, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/teacher", label: "Dashboard", icon: LayoutDashboard },
  { href: "/teacher/settings", label: "Class settings", icon: Settings },
];

/**
 * Teacher-area navigation in the Aurora dashboard language (ADR-011):
 * sidenav items on desktop, a horizontal pill row on smaller screens.
 * Active = accent-soft fill + accent text (the MUI list-item treatment);
 * every state keeps a visible focus ring.
 */
export default function TeacherNav({
  orientation = "horizontal",
}: {
  orientation?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();
  const vertical = orientation === "vertical";
  return (
    <nav
      aria-label="Teacher"
      className={
        vertical
          ? "flex flex-col gap-1"
          : "flex items-center gap-1 overflow-x-auto"
      }
    >
      {LINKS.map((link) => {
        const active = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center gap-2.5 whitespace-nowrap rounded-lg px-3 text-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent ${
              vertical ? "w-full" : ""
            } ${
              active
                ? "bg-accent-soft font-semibold text-accent-strong"
                : "font-medium text-secondary hover:bg-surface-muted hover:text-primary"
            }`}
          >
            <link.icon className="h-5 w-5 shrink-0" aria-hidden />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
