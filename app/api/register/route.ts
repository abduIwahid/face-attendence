import { createAdminClient } from "../../../lib/supabase/admin";
import { clientIp, fail, ok, readJsonBody } from "../../../lib/http";
import { checkRateLimit, RATE_LIMITS } from "../../../lib/rateLimit";
import { registerSchema } from "../../../lib/validation";

const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/** JPEG magic bytes: FF D8 FF (brain/SECURITY.md sweep #12). */
function isJpeg(bytes: Buffer): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

/**
 * POST /api/register — register a student (brain/API_SPEC.md).
 * All checks run server-side; the descriptor and photo are stored via the
 * service-role client, never by the browser directly (brain/DATA_MODEL.md).
 */
export async function POST(request: Request) {
  const ip = clientIp(request);
  const rate = checkRateLimit(
    `register:${ip}`,
    RATE_LIMITS.registerPerIp.limit,
    RATE_LIMITS.registerPerIp.windowMs,
  );
  if (!rate.allowed) {
    return fail(
      429,
      "RATE_LIMITED",
      "Too many registration attempts from this network. Please try again later.",
    );
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return fail(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    if (field === "consent") {
      return fail(400, "CONSENT_REQUIRED", "Consent is required to register.");
    }
    if (field === "descriptor") {
      return fail(
        400,
        "INVALID_DESCRIPTOR",
        "The face data was not valid. Please retake your selfie and try again.",
      );
    }
    return fail(400, "VALIDATION_ERROR", issue?.message ?? "Invalid registration details.");
  }
  const input = parsed.data;

  // Photo (optional in the spec): validate by content, never by name/type.
  let photoBytes: Buffer | null = null;
  if (input.photo !== undefined) {
    photoBytes = Buffer.from(input.photo, "base64");
    if (photoBytes.length === 0 || photoBytes.length > MAX_PHOTO_BYTES || !isJpeg(photoBytes)) {
      return fail(
        400,
        "INVALID_PHOTO",
        "The registration photo must be a real JPEG under 2 MB. Please retake it.",
      );
    }
  }

  const admin = createAdminClient();

  const { data: existing, error: lookupError } = await admin
    .from("students")
    .select("id")
    .eq("roll_number", input.roll_number)
    .maybeSingle();
  if (lookupError) {
    return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
  }
  if (existing) {
    return fail(
      409,
      "ROLL_TAKEN",
      "This roll number is already registered. If this is you, go to Mark Attendance; if not, please ask your teacher.",
    );
  }

  let photoPath: string | null = null;
  if (photoBytes) {
    const objectName = `${input.roll_number}.jpg`;
    const { error: uploadError } = await admin.storage
      .from("registration-photos")
      .upload(objectName, photoBytes, { contentType: "image/jpeg", upsert: false });
    if (uploadError) {
      return fail(
        500,
        "SERVER_ERROR",
        "We could not save your registration photo. Please try again.",
      );
    }
    photoPath = `registration-photos/${objectName}`;
  }

  const { data: student, error: insertError } = await admin
    .from("students")
    .insert({
      name: input.name,
      roll_number: input.roll_number,
      descriptor: input.descriptor,
      photo_path: photoPath,
      consent_at: new Date().toISOString(),
    })
    .select("id, name, roll_number")
    .single();

  if (insertError || !student) {
    // Do not leave an orphaned photo behind on a failed registration.
    if (photoPath) {
      await admin.storage
        .from("registration-photos")
        .remove([`${input.roll_number}.jpg`])
        .catch(() => undefined);
    }
    if (insertError?.code === "23505") {
      return fail(
        409,
        "ROLL_TAKEN",
        "This roll number is already registered. If this is you, go to Mark Attendance; if not, please ask your teacher.",
      );
    }
    return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
  }

  return ok({ student }, 201);
}
