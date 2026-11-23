/**
 * Best-of-several GPS sampling — browser only (session 07, ADR-009).
 *
 * A single-shot `getCurrentPosition` indoors routinely returns a fix that
 * is 100–200 m off: the browser answers with the first (often Wi-Fi/cell
 * based) position it has. `watchPosition` keeps refining, so this routine
 * samples for up to ~10 s and keeps the reading with the smallest reported
 * accuracy, stopping early once a fix is at or below the target accuracy.
 * Both location consumers (/verify and the teacher class-location setter)
 * use it, so the class point and the student fix are measured the same way.
 */

export interface BestFix {
  latitude: number;
  longitude: number;
  /** The phone's own error estimate for this fix, whole metres (≥ 1). */
  accuracyMeters: number;
}

export interface SampleBestPositionOptions {
  /** Stop as soon as a fix at or below this accuracy arrives. Default 20 m. */
  targetAccuracyMeters?: number;
  /** Hard stop for sampling, milliseconds. Default 10_000. */
  maxDurationMs?: number;
  /** Called with the new best fix every time the accuracy improves. */
  onUpdate?: (fix: BestFix) => void;
}

export type SampleBestPositionResult =
  | { kind: "ok"; fix: BestFix }
  | { kind: "denied" }
  | { kind: "unavailable" };

export function sampleBestPosition(
  options: SampleBestPositionOptions = {},
): Promise<SampleBestPositionResult> {
  const targetAccuracyMeters = options.targetAccuracyMeters ?? 20;
  const maxDurationMs = options.maxDurationMs ?? 10_000;

  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) {
      resolve({ kind: "unavailable" });
      return;
    }

    let best: BestFix | null = null;
    let settled = false;
    let watchId = -1;
    let timer = 0;

    const finish = (result: SampleBestPositionResult) => {
      if (settled) return;
      settled = true;
      if (watchId >= 0) navigator.geolocation.clearWatch(watchId);
      window.clearTimeout(timer);
      resolve(result);
    };

    timer = window.setTimeout(() => {
      finish(best !== null ? { kind: "ok", fix: best } : { kind: "unavailable" });
    }, maxDurationMs);

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        const fix: BestFix = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracyMeters: Math.max(1, Math.round(position.coords.accuracy)),
        };
        if (best === null || fix.accuracyMeters < best.accuracyMeters) {
          best = fix;
          options.onUpdate?.(fix);
        }
        if (fix.accuracyMeters <= targetAccuracyMeters) {
          finish({ kind: "ok", fix });
        }
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          finish({ kind: "denied" });
        }
        // Transient errors (timeout / position unavailable) are not final:
        // a later watch update may still deliver a fix before the deadline.
      },
      { enableHighAccuracy: true, maximumAge: 0 },
    );
  });
}
