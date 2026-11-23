import { fail, ok, readJsonBody } from "../../../lib/http";
import { createAdminClient } from "../../../lib/supabase/admin";
import { createClient } from "../../../lib/supabase/server";
import { deleteStudentSchema } from "../../../lib/validation";

interface StudentSummary {
  id: string;
  name: string;
  roll_number: string;
  created_at: string;
}

/**
 * GET /api/students — the registered-students list for the teacher
 * (name + roll number + registration date only; descriptors never leave
 * the server — ADR-008). Teacher session required; the read runs through
 * the teacher's session client under the RLS teacher-read policy.
 */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return fail(401, "UNAUTHORIZED", "Teacher sign-in is required.");
  }

  const { data, error } = await supabase
    .from("students")
    .select("id, name, roll_number, created_at")
    .order("created_at", { ascending: true });
  if (error) {
    return fail(
      500,
      "SERVER_ERROR",
      "Something went wrong on our side. Please try again.",
    );
  }
  return ok({ students: data as StudentSummary[] });
}

/**
 * DELETE /api/students — remove one student's record completely
 * (brain/ETHICS_PRIVACY.md principle 4: the deletion path is real
 * deletion — the students row, its descriptor, its attendance history
 * and the stored registration photo). Teacher session required; the
 * writes go through the service role because RLS grants the teacher
 * reads only. The photo is removed first so a storage failure aborts
 * the deletion with nothing half-deleted.
 */
export async function DELETE(request: Request) {
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
  const parsed = deleteStudentSchema.safeParse(body);
  if (!parsed.success) {
    return fail(
      400,
      "VALIDATION_ERROR",
      parsed.error.issues[0]?.message ?? "Invalid student id.",
    );
  }

  const admin = createAdminClient();
  const { data: student, error: lookupError } = await admin
    .from("students")
    .select("id, photo_path")
    .eq("id", parsed.data.id)
    .maybeSingle();
  if (lookupError) {
    return fail(
      500,
      "SERVER_ERROR",
      "Something went wrong on our side. Please try again.",
    );
  }
  if (!student) {
    return fail(404, "NOT_FOUND", "That student record no longer exists.");
  }

  if (student.photo_path) {
    // photo_path is stored as "registration-photos/<roll>.jpg"; the
    // storage API wants the object name inside the bucket.
    const objectName = student.photo_path.replace(/^registration-photos\//, "");
    const { error: photoError } = await admin.storage
      .from("registration-photos")
      .remove([objectName]);
    if (photoError) {
      return fail(
        500,
        "SERVER_ERROR",
        "The registration photo could not be removed, so nothing was deleted. Please try again.",
      );
    }
  }

  const { error: attendanceError } = await admin
    .from("attendance")
    .delete()
    .eq("student_id", student.id);
  if (attendanceError) {
    return fail(
      500,
      "SERVER_ERROR",
      "Something went wrong on our side. Please try again.",
    );
  }

  const { error: deleteError } = await admin
    .from("students")
    .delete()
    .eq("id", student.id);
  if (deleteError) {
    return fail(
      500,
      "SERVER_ERROR",
      "Something went wrong on our side. Please try again.",
    );
  }

  return ok({ deleted: true });
}
