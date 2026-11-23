import { z } from "zod";

/**
 * Zod schemas — the single source for every input boundary
 * (brain/SECURITY.md + brain/API_SPEC.md). API routes parse with these and
 * reject on the first failure using the standard error format.
 */

/** A face descriptor is exactly 128 finite numbers (face-api.js output). */
export const descriptorSchema = z
  .array(z.number().finite())
  .length(128, "Descriptor must contain exactly 128 numbers");

/** Roll numbers are normalised to uppercase (e.g. FA24-BAI-024). */
export const rollNumberSchema = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .pipe(
    z
      .string()
      .min(3, "Roll number is too short")
      .max(20, "Roll number is too long")
      .regex(/^[A-Z0-9-]+$/, "Roll number may only contain letters, numbers and dashes"),
  );

export const studentNameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(60, "Name must be at most 60 characters");

/** POST /api/register body (API_SPEC.md). */
export const registerSchema = z.object({
  name: studentNameSchema,
  roll_number: rollNumberSchema,
  descriptor: descriptorSchema,
  /** Optional base64 JPEG — magic bytes are verified in the route (Phase 2). */
  photo: z.string().optional(),
  consent: z.literal(true, "Consent is required to register"),
});

/** POST /api/verify body (API_SPEC.md). */
export const verifySchema = z.object({
  roll_number: rollNumberSchema,
  descriptor: descriptorSchema,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  gps_accuracy_meters: z.number().int().min(0),
});

/** PATCH /api/class-settings body (API_SPEC.md) — radius 10–1000 m. */
export const classSettingsSchema = z.object({
  class_name: z.string().trim().min(1).max(80).optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius_meters: z.number().int().min(10).max(1000),
});

/** Teacher sign-in form (Supabase Auth email/password). */
export const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyInput = z.infer<typeof verifySchema>;
export type ClassSettingsInput = z.infer<typeof classSettingsSchema>;
