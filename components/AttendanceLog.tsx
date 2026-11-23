"use client";

import { CalendarDays, ClipboardList, Download, Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { todayInKarachi } from "../lib/dates";
import {
  exportFileName,
  faceMatchLabel,
  failureReasonLabel,
  type LogRow,
} from "../lib/log";

type LoadState = "loading" | "ready" | "error";

/**
 * Teacher attendance log (brain/PRD.md teacher view + brain/API_SPEC.md
 * GET /api/log): one day at a time, defaulting to today (Asia/Karachi),
 * with the SheetJS .xlsx export of exactly the rows on screen. All states
 * per brain/DESIGN.md: skeleton while loading, an honest empty state, and
 * an error state with retry — never a raw error string.
 */
export default function AttendanceLog() {
  const [date, setDate] = useState(() => todayInKarachi());
  const [rows, setRows] = useState<LogRow[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const load = useCallback(async (forDate: string) => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch(`/api/log?date=${forDate}`);
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true &&
        "data" in payload
      ) {
        const data = payload.data as { rows: LogRow[] };
        setRows(data.rows);
        setState("ready");
        return;
      }
      const message =
        payload !== null &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error !== null &&
        typeof payload.error === "object" &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
          ? payload.error.message
          : "The attendance log could not be loaded.";
      setError(message);
      setState("error");
    } catch {
      setError("The attendance log could not be loaded — check your connection and try again.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    // The effect synchronizes with an external system (the log API); the
    // "loading" state update inside load() is its setup, not a render
    // cascade — same justified pattern as CameraCapture (session 06).
    /* eslint-disable react-hooks/set-state-in-effect */
    void load(date);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [date, load]);

  async function handleExport() {
    setExporting(true);
    setExportError(null);
    try {
      // SheetJS loads on demand so the teacher page's first paint stays light.
      const { buildAttendanceWorkbook } = await import("../lib/exportXlsx");
      const buffer = buildAttendanceWorkbook(rows);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = exportFileName(date);
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setExportError("The Excel file could not be created. Please try again.");
    } finally {
      setExporting(false);
    }
  }

  const presentCount = rows.filter((row) => row.status === "PRESENT").length;
  const failedCount = rows.length - presentCount;

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
            <ClipboardList className="h-5 w-5 text-accent-strong" aria-hidden />
            Attendance log
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-secondary">
            Every attempt for the selected day — present and failed — with the
            face-match result and the GPS distance recorded at the time.
          </p>
        </div>
        <button
          type="button"
          onClick={handleExport}
          disabled={state !== "ready" || rows.length === 0 || exporting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-base font-semibold text-white transition-all hover:bg-accent-strong disabled:bg-surface-muted disabled:text-secondary"
        >
          {exporting ? (
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
          ) : (
            <Download className="h-5 w-5" aria-hidden />
          )}
          {exporting ? "Creating…" : "Download .xlsx"}
        </button>
      </div>

      <div className="mt-5 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="logDate" className="text-sm font-medium text-primary">
            Date
          </label>
          <input
            id="logDate"
            type="date"
            value={date}
            max={todayInKarachi()}
            onChange={(event) => {
              if (event.target.value) setDate(event.target.value);
            }}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="button"
          onClick={() => setDate(todayInKarachi())}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
        >
          <CalendarDays className="h-5 w-5" aria-hidden />
          Today
        </button>
        {state === "ready" && rows.length > 0 ? (
          <p className="text-sm text-secondary" role="status">
            <span className="font-semibold text-success">{presentCount} present</span>
            {" · "}
            <span className="font-semibold text-danger">{failedCount} failed</span>
            {" · "}
            {rows.length} total
          </p>
        ) : null}
      </div>

      {exportError ? (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          {exportError}
        </p>
      ) : null}

      <div className="mt-5">
        {state === "loading" ? (
          <div aria-label="Loading attendance log" className="flex flex-col gap-2">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="h-12 animate-pulse rounded-lg bg-surface-muted"
              />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="rounded-lg bg-danger-soft px-4 py-5 text-center">
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load(date)}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
            >
              Try again
            </button>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-lg bg-surface-muted px-4 py-8 text-center">
            <ClipboardList className="mx-auto h-8 w-8 text-secondary" aria-hidden />
            <p className="mt-2 text-base font-medium text-primary">
              No attendance recorded for this date yet.
            </p>
            <p className="mt-1 text-sm text-secondary">
              When a student marks attendance, their attempt will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-surface-muted text-primary">
                  <th scope="col" className="px-3 py-2.5 font-semibold">Time</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Name</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Roll Number</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Face Match</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Distance</th>
                  <th scope="col" className="px-3 py-2.5 font-semibold">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={`${row.roll_number}-${row.time}-${index}`}
                    className="border-t border-border transition-colors hover:bg-surface-muted"
                  >
                    <td className="whitespace-nowrap px-3 py-2.5 text-secondary">
                      {row.time}
                    </td>
                    <td className="px-3 py-2.5 font-medium text-primary">{row.name}</td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-secondary">
                      {row.roll_number}
                    </td>
                    <td className="px-3 py-2.5 text-secondary">
                      {faceMatchLabel(row.face_match)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-2.5 text-secondary">
                      {row.distance_meters !== null
                        ? `${row.distance_meters} m`
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5">
                      {row.status === "PRESENT" ? (
                        <span className="font-semibold text-success">PRESENT</span>
                      ) : (
                        <>
                          <span className="font-semibold text-danger">FAILED</span>
                          {row.failure_reason ? (
                            <span className="block text-xs text-secondary">
                              {failureReasonLabel(row.failure_reason)}
                            </span>
                          ) : null}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
