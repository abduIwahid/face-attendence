import { fail, ok, readJsonBody } from "../../../lib/http";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createClient } from "../../../lib/supabase/server";
import { classSettingsSchema } from "../../../lib/validation";

interface ClassSettingsData {
  class_name: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
  updated_at: string | null;
}

/**
 * GET /api/class-settings — public class location for the verify flow
 * (brain/API_SPEC.md; the location is readable by design, DATA_MODEL.md).
 */
export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("class_settings")
    .select("class_name, latitude, longitude, radius_meters, updated_at")
    .eq("id", 1)
    .maybeSingle();
  if (error) {
    return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
  }
  if (!data) {
    return fail(
      404,
      "CLASS_NOT_SET",
      "The class location has not been set yet. The teacher needs to set it before attendance can be marked.",
    );
  }
  return ok(data as ClassSettingsData);
}

/**
 * PATCH /api/class-settings — teacher only (brain/API_SPEC.md).
 * The session is verified server-side first; the write then goes through
 * the service role so the singleton row can also be created the first
 * time (RLS grants the teacher update, and service role is the full-access
 * path per brain/DATA_MODEL.md).
 */
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail(401, "UNAUTHORIZED", "Teacher sign-in is required.");
  }

  const body = await readJsonBody(request);
  if (body === null) {
    return fail(400, "VALIDATION_ERROR", "Request body must be valid JSON.");
  }
  const parsed = classSettingsSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    if (issue?.path[0] === "radius_meters") {
      return fail(400, "INVALID_RADIUS", "Radius must be between 10 and 1000 metres.");
    }
    return fail(400, "VALIDATION_ERROR", issue?.message ?? "Invalid class settings.");
  }

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("class_settings")
    .select("class_name")
    .eq("id", 1)
    .maybeSingle();

  const row = {
    id: 1,
    class_name: parsed.data.class_name ?? existing?.class_name ?? "Class",
    latitude: parsed.data.latitude,
    longitude: parsed.data.longitude,
    radius_meters: parsed.data.radius_meters,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await admin
    .from("class_settings")
    .upsert(row, { onConflict: "id" })
    .select("class_name, latitude, longitude, radius_meters, updated_at")
    .single();
  if (error || !data) {
    return fail(500, "SERVER_ERROR", "Something went wrong on our side. Please try again.");
  }
  return ok(data as ClassSettingsData);
}
