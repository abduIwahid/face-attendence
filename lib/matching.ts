/**
 * Face-descriptor math — pure functions, no dependencies.
 * Used by the verify API route (server-side compare, brain/DECISIONS.md
 * ADR-008) and unit-tested in `matching.test.ts`.
 */

/**
 * Match threshold (brain/DECISIONS.md ADR-006): face-api.js's documented
 * default euclidean distance for "same person". A live descriptor matches
 * the registered one when its distance is BELOW this value (the same
 * strict comparison face-api's own FaceMatcher uses).
 */
export const FACE_MATCH_THRESHOLD = 0.6;

/** Euclidean distance between two equal-length descriptors. */
export function euclideanDistance(
  a: readonly number[],
  b: readonly number[],
): number {
  if (a.length !== b.length) {
    throw new Error(
      `Descriptor length mismatch: ${a.length} vs ${b.length}`,
    );
  }
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) {
    const diff = a[i] - b[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}

/** True when a face distance counts as the same person (ADR-006). */
export function isFaceMatch(
  distance: number,
  threshold: number = FACE_MATCH_THRESHOLD,
): boolean {
  return distance < threshold;
}
