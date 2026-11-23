import { formatTimeKarachi } from "./dates.ts";

/**
 * Teacher-log shaping + Excel-export rows (brain/PRD.md teacher view,
 * brain/API_SPEC.md GET /api/log + Export). Pure functions — the API route
 * shapes DB rows through here and the export builds its sheet from the
 * same rows, so what the teacher sees is exactly what the .xlsx contains.
 * Unit-tested in lib/log.test.ts.
 */

/** One attendance row as GET /api/log returns it and the UI renders it. */
export interface LogRow {
  name: string;
  roll_number: string;
  /** YYYY-MM-DD (Asia/Karachi server date, stored on the row). */
  date: string;
  /** HH:MM:SS in Asia/Karachi, formatted from the stored timestamp. */
  time: string;
  /** MATCHED | NOT_MATCHED | NO_FACE | MULTIPLE_FACES */
  face_match: string;
  /** Raw GPS distance in metres; null when GPS was unavailable. */
  distance_meters: number | null;
  gps_accuracy_meters: number | null;
  /** PRESENT | FAILED */
  status: string;
  /** Machine reason on FAILED rows (e.g. TOO_FAR); null on PRESENT. */
  failure_reason: string | null;
}

/** Raw row shape returned by the attendance ⨝ students PostgREST query. */
export interface AttendanceDbRow {
  date: string;
  time: string; // timestamptz, ISO string
  face_match: string;
  distance_meters: number | null;
  gps_accuracy_meters: number | null;
  status: string;
  failure_reason: string | null;
  students: { name: string; roll_number: string } | null;
}

export function shapeLogRow(row: AttendanceDbRow): LogRow {
  return {
    name: row.students?.name ?? "Unknown student",
    roll_number: row.students?.roll_number ?? "—",
    date: row.date,
    time: formatTimeKarachi(row.time),
    face_match: row.face_match,
    distance_meters: row.distance_meters,
    gps_accuracy_meters: row.gps_accuracy_meters,
    status: row.status,
    failure_reason: row.failure_reason,
  };
}

const FACE_MATCH_LABELS: Record<string, string> = {
  MATCHED: "Matched",
  NOT_MATCHED: "Not matched",
  NO_FACE: "No face found",
  MULTIPLE_FACES: "Multiple faces",
};

export function faceMatchLabel(faceMatch: string): string {
  return FACE_MATCH_LABELS[faceMatch] ?? faceMatch;
}

const FAILURE_REASON_LABELS: Record<string, string> = {
  FACE_NOT_MATCHED: "Face did not match",
  TOO_FAR: "Too far from the class location",
};

export function failureReasonLabel(reason: string | null): string {
  if (reason === null) {
    return "";
  }
  return FAILURE_REASON_LABELS[reason] ?? reason;
}

/** The PRD export columns, in order. */
export const EXPORT_HEADERS = [
  "Date",
  "Time",
  "Name",
  "Roll Number",
  "Face Match",
  "Distance (m)",
  "Result",
] as const;

/** One .xlsx data row per log row (PRD columns; distance blank if none). */
export function toExportRows(rows: LogRow[]): (string | number)[][] {
  return rows.map((row) => [
    row.date,
    row.time,
    row.name,
    row.roll_number,
    faceMatchLabel(row.face_match),
    row.distance_meters ?? "",
    row.status,
  ]);
}

/** attendance-YYYY-MM-DD.xlsx — the filename carries the exported day. */
export function exportFileName(date: string): string {
  return `attendance-${date}.xlsx`;
}
