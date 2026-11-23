"use client";

import { Loader2, Trash2, Users } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface StudentSummary {
  id: string;
  name: string;
  roll_number: string;
  created_at: string;
}

type LoadState = "loading" | "ready" | "error";

/**
 * Registered-students list for the teacher (GET /api/students — names and
 * roll numbers only; descriptors never leave the server). Includes the
 * deletion path brain/ETHICS_PRIVACY.md principle 4 promises at
 * registration: one confirmed action removes the student's record, face
 * descriptor, registration photo and attendance history — real deletion,
 * not a flag (DELETE /api/students).
 */
export default function StudentsList() {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [state, setState] = useState<LoadState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setState("loading");
    setError(null);
    try {
      const response = await fetch("/api/students");
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true &&
        "data" in payload
      ) {
        const data = payload.data as { students: StudentSummary[] };
        setStudents(data.students);
        setState("ready");
        return;
      }
      setError("The student list could not be loaded.");
      setState("error");
    } catch {
      setError("The student list could not be loaded — check your connection and try again.");
      setState("error");
    }
  }, []);

  useEffect(() => {
    // The effect synchronizes with an external system (the students API);
    // the "loading" state update inside load() is its setup, not a render
    // cascade — same justified pattern as CameraCapture (session 06).
    /* eslint-disable react-hooks/set-state-in-effect */
    void load();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [load]);

  async function handleRemove(student: StudentSummary) {
    setRemovingId(student.id);
    setRemoveError(null);
    try {
      const response = await fetch("/api/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: student.id }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true
      ) {
        setStudents((current) => current.filter((s) => s.id !== student.id));
        setConfirmingId(null);
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
          : "The record could not be removed. Please try again.";
      setRemoveError(message);
    } catch {
      setRemoveError("The record could not be removed — check your connection and try again.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
        <Users className="h-5 w-5 text-accent-strong" aria-hidden />
        Registered students
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-secondary">
        Students register themselves from the Register page. Removing a
        student permanently deletes their face descriptor, registration photo
        and attendance history — the deletion students are promised when they
        register.
      </p>

      {removeError ? (
        <p role="alert" className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
          {removeError}
        </p>
      ) : null}

      <div className="mt-5">
        {state === "loading" ? (
          <div aria-label="Loading students" className="flex flex-col gap-2">
            {[0, 1].map((index) => (
              <div key={index} className="h-12 animate-pulse rounded-lg bg-surface-muted" />
            ))}
          </div>
        ) : state === "error" ? (
          <div className="rounded-lg bg-danger-soft px-4 py-5 text-center">
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted"
            >
              Try again
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="rounded-lg bg-surface-muted px-4 py-8 text-center">
            <Users className="mx-auto h-8 w-8 text-secondary" aria-hidden />
            <p className="mt-2 text-base font-medium text-primary">
              No students registered yet.
            </p>
            <p className="mt-1 text-sm text-secondary">
              Share the Register page with your class — registrations will
              appear here.
            </p>
          </div>
        ) : (
          <ul className="flex flex-col divide-y divide-border">
            {students.map((student) => (
              <li
                key={student.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent-strong"
                  >
                    {student.name.trim().charAt(0).toUpperCase() || "?"}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-medium text-primary">
                      {student.name}
                    </p>
                    <p className="text-sm text-secondary">
                      {student.roll_number} · Registered{" "}
                      {new Date(student.created_at).toLocaleDateString("en-GB", {
                        timeZone: "Asia/Karachi",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {confirmingId === student.id ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-danger">
                      Permanently remove this student and all their data?
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleRemove(student)}
                      disabled={removingId === student.id}
                      className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-danger px-4 text-sm font-semibold text-white transition-colors disabled:opacity-60"
                    >
                      {removingId === student.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      ) : null}
                      {removingId === student.id ? "Removing…" : "Yes, remove"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmingId(null)}
                      disabled={removingId === student.id}
                      className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-primary transition-colors hover:bg-surface-muted disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmingId(student.id);
                      setRemoveError(null);
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-semibold text-danger transition-colors hover:bg-danger-soft"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
