import { todayInKarachi } from "../../../lib/dates";
import { fail, ok } from "../../../lib/http";
import { shapeLogRow, type AttendanceDbRow } from "../../../lib/log";
import { createClient } from "../../../lib/supabase/server";
import { logDateSchema } from "../../../lib/validation";

/**
 * GET /api/log?date=YYYY-MM-DD — the teacher attendance log for one day
 * (brain/API_SPEC.md). Teacher session required; the read itself runs
 * through the teacher's own session client, so the RLS teacher-read
 * policies are the enforcing wall (brain/DATA_MODEL.md — no service role
 * for display data). Defaults to today (Asia/Karachi) when no date given.
 */
export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail(401, "UNAUTHORIZED", "Teacher sign-in is required.");
  }

  const dateParam = new URL(request.url).searchParams.get("date");
  const date = dateParam ?? todayInKarachi();
  if (!logDateSchema.safeParse(date).success) {
    return fail(
      400,
      "VALIDATION_ERROR",
      "Date must be a real date in YYYY-MM-DD format.",
    );
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      "date, time, face_match, distance_meters, gps_accuracy_meters, status, failure_reason, students(name, roll_number)",
    )
    .eq("date", date)
    .order("time", { ascending: true });
  if (error) {
    return fail(
      500,
      "SERVER_ERROR",
      "Something went wrong on our side. Please try again.",
    );
  }

  const rows = (data as unknown as AttendanceDbRow[]).map(shapeLogRow);
  return ok({ date, rows });
}
