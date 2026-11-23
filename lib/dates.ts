/**
 * Date/time helpers — every user-facing date in this app is Asia/Karachi
 * (brain/API_SPEC.md: the attendance `date` column is the Karachi server
 * date, and the teacher reads times in Karachi too). Pure and unit-tested
 * (lib/log.test.ts).
 */

const KARACHI_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Karachi",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const KARACHI_TIME = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Karachi",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

/** YYYY-MM-DD in Asia/Karachi for the given instant (default: now). */
export function todayInKarachi(now: Date = new Date()): string {
  return KARACHI_DATE.format(now);
}

/** HH:MM:SS in Asia/Karachi for an ISO timestamp string. */
export function formatTimeKarachi(isoTimestamp: string): string {
  return KARACHI_TIME.format(new Date(isoTimestamp));
}

/** Strict YYYY-MM-DD that is also a real calendar date (2026-02-30 is not). */
export function isValidDateString(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }
  const probe = new Date(Date.UTC(year, month - 1, day));
  return (
    probe.getUTCFullYear() === year &&
    probe.getUTCMonth() === month - 1 &&
    probe.getUTCDate() === day
  );
}
