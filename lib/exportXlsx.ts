import * as XLSX from "xlsx";
import { EXPORT_HEADERS, toExportRows, type LogRow } from "./log.ts";

/**
 * Build the teacher's .xlsx workbook (SheetJS — brain/PRD.md MUST +
 * brain/API_SPEC.md "Export": no endpoint, the teacher page generates the
 * file client-side from the GET /api/log response). Kept as its own module
 * so the workbook bytes can be round-trip-verified in lib/log.test.ts.
 */
export function buildAttendanceWorkbook(rows: LogRow[]): ArrayBuffer {
  const sheet = XLSX.utils.aoa_to_sheet([
    [...EXPORT_HEADERS],
    ...toExportRows(rows),
  ]);
  sheet["!cols"] = [
    { wch: 12 }, // Date
    { wch: 10 }, // Time
    { wch: 26 }, // Name
    { wch: 16 }, // Roll Number
    { wch: 14 }, // Face Match
    { wch: 13 }, // Distance (m)
    { wch: 10 }, // Result
  ];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Attendance");
  return XLSX.write(workbook, {
    type: "array",
    bookType: "xlsx",
  }) as ArrayBuffer;
}
