import { isWithinRadius } from "./geo.ts";
import { isFaceMatch } from "./matching.ts";

/**
 * The verify decision — pure and ordered (brain/API_SPEC.md POST /api/verify).
 * The route gathers the facts; this function alone decides the outcome, so
 * the rejection ordering is testable and never drifts between code paths.
 *
 * Order (first match wins):
 *   1. RATE_LIMITED      — too many attempts for this roll number
 *   2. NOT_REGISTERED    — no student with this roll number
 *   3. ALREADY_MARKED    — a PRESENT row already exists for today
 *   4. GPS_INACCURATE    — fix coarser than the 250 m cap is not a location proof
 *   5. FACE_NOT_MATCHED  — face distance at/above the ADR-006 threshold
 *   6. TOO_FAR           — effective distance outside the class radius
 *   7. PRESENT           — everything passed
 *
 * The radius is judged on the **effective distance** (ADR-009):
 * `max(0, raw distance − GPS accuracy)`. Indoor GPS drift of 100–200 m is
 * the normal classroom case, not an exception — a student whose raw fix
 * lands 165 m away with ±160 m accuracy may genuinely be in the room.
 * Outcomes still carry the RAW distance, and the route stores raw distance
 * + accuracy on the attendance row, so a teacher can audit marginal passes.
 *
 * `faceDistance` / `distanceMeters` are only consulted after the gates that
 * precede them, so the route may pass null when they could not be computed
 * (e.g. no registered descriptor to compare against).
 */

/**
 * GPS accuracy cap in metres (brain/SECURITY.md, ADR-009 — raised from
 * ADR-004's 50 m: a single indoor fix is routinely coarser than 50 m, and
 * the client now samples for the best fix before submitting).
 */
export const GPS_ACCURACY_CAP_METERS = 250;

/**
 * Accuracy-aware distance (ADR-009): the raw haversine distance minus the
 * fix's own error estimate, floored at 0. This is the value the radius
 * decision uses; the raw distance is what gets stored and displayed.
 */
export function effectiveDistanceMeters(
  distanceMeters: number,
  gpsAccuracyMeters: number,
): number {
  return Math.max(0, distanceMeters - gpsAccuracyMeters);
}

export interface VerifyFacts {
  rateLimited: boolean;
  registered: boolean;
  alreadyMarkedToday: boolean;
  gpsAccuracyMeters: number;
  faceDistance: number | null;
  distanceMeters: number | null;
  radiusMeters: number;
}

export type VerifyOutcome =
  | { kind: "RATE_LIMITED" }
  | { kind: "NOT_REGISTERED" }
  | { kind: "ALREADY_MARKED" }
  | { kind: "GPS_INACCURATE" }
  | { kind: "FACE_NOT_MATCHED"; faceDistance: number; distanceMeters: number | null }
  | { kind: "TOO_FAR"; faceDistance: number; distanceMeters: number }
  | { kind: "PRESENT"; faceDistance: number; distanceMeters: number };

export function decideVerifyOutcome(facts: VerifyFacts): VerifyOutcome {
  if (facts.rateLimited) {
    return { kind: "RATE_LIMITED" };
  }
  if (!facts.registered) {
    return { kind: "NOT_REGISTERED" };
  }
  if (facts.alreadyMarkedToday) {
    return { kind: "ALREADY_MARKED" };
  }
  if (facts.gpsAccuracyMeters > GPS_ACCURACY_CAP_METERS) {
    return { kind: "GPS_INACCURATE" };
  }
  if (facts.faceDistance === null || !isFaceMatch(facts.faceDistance)) {
    return {
      kind: "FACE_NOT_MATCHED",
      faceDistance: facts.faceDistance ?? Number.POSITIVE_INFINITY,
      distanceMeters: facts.distanceMeters,
    };
  }
  if (
    facts.distanceMeters === null ||
    !isWithinRadius(
      effectiveDistanceMeters(facts.distanceMeters, facts.gpsAccuracyMeters),
      facts.radiusMeters,
    )
  ) {
    return {
      kind: "TOO_FAR",
      faceDistance: facts.faceDistance,
      distanceMeters: facts.distanceMeters ?? Number.POSITIVE_INFINITY,
    };
  }
  return {
    kind: "PRESENT",
    faceDistance: facts.faceDistance,
    distanceMeters: facts.distanceMeters,
  };
}
