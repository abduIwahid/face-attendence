import { haversineMeters } from "../../../lib/geo";
import { fail, ok, readJsonBody } from "../../../lib/http";
import { euclideanDistance } from "../../../lib/matching";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rateLimit";
import { createAdminClient } from "../../../lib/supabase/admin";
import { verifySchema } from "../../../lib/validation";
import { decideVerifyOutcome } from "../../../lib/verify";

/** Server date in Asia/Karachi as YYYY-MM-DD (brain/API_SPEC.md). */
function todayInKarachi(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function isDescriptorArray(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length === 128 &&
    value.every((entry) => typeof entry === "number" && Number.isFinite(entry))
  );
}

/**
 * POST /api/verify — submit a verification attempt (brain/API_SPEC.md).
 * The server trusts nothing from the client: it re-loads the registered
 * descriptor, recomputes the face distance and the haversine distance,
 * and re-checks accuracy, duplicates and rate limits itself. The ordered
 * decision lives in `lib/verify.ts`.
 */
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body === null) {
    return fail(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "descriptor") {
      return fail(
        400,
        "INVALID_DESCRIPTOR",
        "The face data was not valid. Please retake your selfie and try again.",
      );
    }
    return fail(400, "VALIDATION_ERROR", issue?.message ?? "Invalid verification details.");
  }
  const input = parsed.data;

  const rate = checkRateLimit(
    `verify:${input.roll_number}`,
    RATE_LIMITS.verifyPerRoll.limit,
    RATE_LIMITS.verifyPerRoll.windowMs,
  );

  const admin = createAdminClient();

  const { data: student, error: studentError } = await admin
    .from("students")
    .select("id, descriptor")
    .eq("roll_number", input.roll_number)
    .maybeSingle();
  if (studentError) {
    return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
  }

  // The class location is a precondition for any real check; only consulted
  // once the student is known to exist, and reported in plain language.
  let settings: { latitude: number; longitude: number; radius_meters: number } | null =
    null;
  let alreadyMarked = false;
  let faceDistance: number | null = null;
  let distanceMeters: number | null = null;

  if (student) {
    const { data: settingsRow, error: settingsError } = await admin
      .from("class_settings")
      .select("latitude, longitude, radius_meters")
      .eq("id", 1)
      .maybeSingle();
    if (settingsError) {
      return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
    }
    if (!settingsRow) {
      return fail(
        422,
        "CLASS_LOCATION_NOT_SET",
        "Your teacher has not set the class location yet, so attendance cannot be checked right now.",
      );
    }
    settings = settingsRow;

    const today = todayInKarachi();
    const { data: presentRow, error: duplicateError } = await admin
      .from("attendance")
      .select("id")
      .eq("student_id", student.id)
      .eq("date", today)
      .eq("status", "PRESENT")
      .maybeSingle();
    if (duplicateError) {
      return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
    }
    alreadyMarked = presentRow !== null;

    if (!isDescriptorArray(student.descriptor)) {
      return fail(
        500,
        "SERVER_ERROR",
        "The registered face data for this roll number is damaged. Please ask your teacher to re-register you.",
      );
    }
    faceDistance = euclideanDistance(student.descriptor, input.descriptor);
    distanceMeters = haversineMeters(
      { latitude: input.latitude, longitude: input.longitude },
      { latitude: settings.latitude, longitude: settings.longitude },
    );
  }

  const outcome = decideVerifyOutcome({
    rateLimited: !rate.allowed,
    registered: student !== null,
    alreadyMarkedToday: alreadyMarked,
    gpsAccuracyMeters: input.gps_accuracy_meters,
    faceDistance,
    distanceMeters,
    radiusMeters: settings?.radius_meters ?? 100,
  });

  switch (outcome.kind) {
    case "RATE_LIMITED":
      return fail(
        429,
        "RATE_LIMITED",
        "Too many attempts for this roll number. Wait a few minutes and try again.",
      );
    case "NOT_REGISTERED":
      return fail(
        404,
        "NOT_REGISTERED",
        "This roll number is not registered yet. Register your face first, then mark attendance.",
      );
    case "ALREADY_MARKED":
      return fail(409, "ALREADY_MARKED", "Attendance is already marked for today.");
    case "GPS_INACCURATE":
      // No attendance row: a fix this rough is not evidence of anything
      // (brain/SECURITY.md) — the student retries near a window instead.
      return fail(
        422,
        "GPS_INACCURATE",
        "Your GPS accuracy is too rough to prove you are here (it needs to be ±50 m or better). Stand near a window and try again.",
      );
    case "FACE_NOT_MATCHED":
    case "TOO_FAR":
    case "PRESENT": {
      const isPresent = outcome.kind === "PRESENT";
      const failureReason =
        outcome.kind === "FACE_NOT_MATCHED"
          ? "FACE_NOT_MATCHED"
          : outcome.kind === "TOO_FAR"
            ? "TOO_FAR"
            : null;
      const { error: insertError } = await admin.from("attendance").insert({
        student_id: student!.id,
        date: todayInKarachi(),
        face_match: outcome.kind === "FACE_NOT_MATCHED" ? "NOT_MATCHED" : "MATCHED",
        distance_meters: outcome.distanceMeters,
        gps_accuracy_meters: input.gps_accuracy_meters,
        status: isPresent ? "PRESENT" : "FAILED",
        failure_reason: failureReason,
      });
      if (insertError) {
        if (isPresent && insertError.code === "23505") {
          // Lost a race against the one-PRESENT-per-day index (the DB backstop).
          return fail(409, "ALREADY_MARKED", "Attendance is already marked for today.");
        }
        return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
      }
      return ok({
        status: isPresent ? "PRESENT" : "FAILED",
        face_match: outcome.kind === "FACE_NOT_MATCHED" ? "NOT_MATCHED" : "MATCHED",
        distance_meters: outcome.distanceMeters,
        ...(failureReason ? { reason: failureReason } : {}),
      });
    }
  }
}
