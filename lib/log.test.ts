import assert from "node:assert/strict";
import { test } from "node:test";
import * as XLSX from "xlsx";
import {
  formatTimeKarachi,
  isValidDateString,
  todayInKarachi,
} from "./dates.ts";
import { buildAttendanceWorkbook } from "./exportXlsx.ts";
import {
  EXPORT_HEADERS,
  exportFileName,
  faceMatchLabel,
  failureReasonLabel,
  shapeLogRow,
  toExportRows,
  type LogRow,
} from "./log.ts";

// Run with: node --test lib/log.test.ts   (Node ≥ 23 strips types natively)

test("todayInKarachi: a UTC evening is already the next day in Karachi", () => {
  // 2026-11-23 20:30 UTC = 2026-11-24 01:30 PKT (UTC+5).
  assert.equal(todayInKarachi(new Date("2026-11-23T20:30:00Z")), "2026-11-24");
});

test("todayInKarachi: just before Karachi midnight stays on the same date", () => {
  // 2026-11-23 18:59:59 UTC = 2026-11-23 23:59:59 PKT.
  assert.equal(todayInKarachi(new Date("2026-11-23T18:59:59Z")), "2026-11-23");
});

test("formatTimeKarachi: renders the Karachi wall-clock time", () => {
  // 03:05:09 UTC = 08:05:09 PKT.
  assert.equal(formatTimeKarachi("2026-11-23T03:05:09.000Z"), "08:05:09");
});

test("isValidDateString: accepts a real date, rejects fakes and bad shapes", () => {
  assert.equal(isValidDateString("2026-11-23"), true);
  assert.equal(isValidDateString("2026-02-30"), false);
  assert.equal(isValidDateString("2026-13-01"), false);
  assert.equal(isValidDateString("23-11-2026"), false);
  assert.equal(isValidDateString("2026-11-23T00:00:00Z"), false);
  assert.equal(isValidDateString(""), false);
});

const DB_ROW = {
  date: "2026-11-23",
  time: "2026-11-23T03:05:09.000Z",
  face_match: "MATCHED",
  distance_meters: 23,
  gps_accuracy_meters: 12,
  status: "PRESENT",
  failure_reason: null,
  students: { name: "Abdul Wahid", roll_number: "FA24-BAI-024" },
};

test("shapeLogRow: joins the student and formats the time for Karachi", () => {
  const row = shapeLogRow(DB_ROW);
  assert.equal(row.name, "Abdul Wahid");
  assert.equal(row.roll_number, "FA24-BAI-024");
  assert.equal(row.time, "08:05:09");
  assert.equal(row.date, "2026-11-23");
  assert.equal(row.distance_meters, 23);
});

test("shapeLogRow: a missing student join degrades honestly, never crashes", () => {
  const row = shapeLogRow({ ...DB_ROW, students: null });
  assert.equal(row.name, "Unknown student");
  assert.equal(row.roll_number, "—");
});

test("labels: face-match and failure-reason read as plain English", () => {
  assert.equal(faceMatchLabel("MATCHED"), "Matched");
  assert.equal(faceMatchLabel("NOT_MATCHED"), "Not matched");
  assert.equal(failureReasonLabel("TOO_FAR"), "Too far from the class location");
  assert.equal(failureReasonLabel("FACE_NOT_MATCHED"), "Face did not match");
  assert.equal(failureReasonLabel(null), "");
});

const LOG_ROW: LogRow = shapeLogRow(DB_ROW);
const FAILED_ROW: LogRow = shapeLogRow({
  ...DB_ROW,
  face_match: "NOT_MATCHED",
  distance_meters: null,
  status: "FAILED",
  failure_reason: "FACE_NOT_MATCHED",
});

test("toExportRows: PRD columns in order; a missing distance exports blank", () => {
  const rows = toExportRows([LOG_ROW, FAILED_ROW]);
  assert.deepEqual(rows[0], [
    "2026-11-23",
    "08:05:09",
    "Abdul Wahid",
    "FA24-BAI-024",
    "Matched",
    23,
    "PRESENT",
  ]);
  assert.equal(rows[1][4], "Not matched");
  assert.equal(rows[1][5], "");
  assert.equal(rows[1][6], "FAILED");
});

test("exportFileName: the filename carries the exported date", () => {
  assert.equal(exportFileName("2026-11-23"), "attendance-2026-11-23.xlsx");
});

test("workbook: the generated .xlsx parses back with headers and data intact", () => {
  const buffer = buildAttendanceWorkbook([LOG_ROW, FAILED_ROW]);
  const workbook = XLSX.read(buffer, { type: "array" });
  assert.deepEqual(workbook.SheetNames, ["Attendance"]);
  const aoa = XLSX.utils.sheet_to_json(workbook.Sheets["Attendance"], {
    header: 1,
  }) as unknown[][];
  assert.deepEqual(aoa[0], [...EXPORT_HEADERS]);
  assert.equal(aoa[1][2], "Abdul Wahid"); // Name
  assert.equal(aoa[1][5], 23); // Distance (m) stays numeric
  assert.equal(aoa[1][6], "PRESENT"); // Result
  assert.equal(aoa[2][6], "FAILED");
  assert.equal(aoa.length, 3); // header + 2 data rows
});
