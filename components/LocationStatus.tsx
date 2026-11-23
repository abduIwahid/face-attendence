import { AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";

export type LocationState =
  | "idle"
  | "sampling"
  | "denied"
  | "unavailable"
  | "inaccurate"
  | "ok";

interface LocationStatusProps {
  state: LocationState;
  accuracyMeters?: number;
  /** Estimated distance to the class, for display only — the server recomputes it. */
  distanceMeters?: number | null;
  radiusMeters?: number;
}

/**
 * GPS state line for the verify page (brain/ARCHITECTURE.md component plan).
 * Includes the honest indoor-GPS note the source reel itself gives:
 * phone GPS drifts indoors — stand near a window and retry.
 *
 * Since session 07 (ADR-009) the page samples fixes for a few seconds and
 * keeps the most accurate one; the server judges the radius on the
 * accuracy-aware effective distance (raw distance − GPS accuracy), and
 * this display mirrors that so what the student sees matches the decision.
 */
export default function LocationStatus({
  state,
  accuracyMeters,
  distanceMeters,
  radiusMeters,
}: LocationStatusProps) {
  if (state === "sampling") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-secondary">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        Improving location accuracy…
        {accuracyMeters !== undefined ? ` Best so far: ±${accuracyMeters} m.` : ""}
      </p>
    );
  }
  if (state === "denied") {
    return (
      <p role="alert" className="flex items-start gap-2 text-sm font-medium text-danger">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Location permission was denied. Attendance needs your location — allow
        it in the browser prompt, then try again.
      </p>
    );
  }
  if (state === "unavailable") {
    return (
      <p role="alert" className="flex items-start gap-2 text-sm font-medium text-danger">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Your device could not provide a location. Phone GPS can be inaccurate
        indoors — if it keeps failing, stand near a window and retry.
      </p>
    );
  }
  if (state === "inaccurate") {
    return (
      <p role="alert" className="flex items-start gap-2 text-sm font-medium text-warning">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        GPS accuracy is ±{accuracyMeters} m — too rough to prove you are here
        (a fix worse than ±250 m cannot be used at all). Stand near a window
        and share your location again.
      </p>
    );
  }
  if (state === "ok") {
    const effectiveDistance =
      distanceMeters !== null && distanceMeters !== undefined
        ? Math.max(0, distanceMeters - (accuracyMeters ?? 0))
        : null;
    const tooFar =
      effectiveDistance !== null &&
      radiusMeters !== undefined &&
      effectiveDistance > radiusMeters;
    const rawLooksFar =
      distanceMeters !== null &&
      distanceMeters !== undefined &&
      radiusMeters !== undefined &&
      distanceMeters > radiusMeters &&
      !tooFar;
    return (
      <div className="flex flex-col gap-1">
        <p role="status" className="flex items-center gap-2 text-sm font-medium text-accent-strong">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
          Location found — accuracy ±{accuracyMeters} m.
        </p>
        {distanceMeters !== null && distanceMeters !== undefined ? (
          <p className={`flex items-center gap-2 text-sm ${tooFar ? "font-medium text-warning" : "text-secondary"}`}>
            <MapPin className="h-4 w-4 shrink-0" aria-hidden />
            You are about {distanceMeters} m from the class
            {radiusMeters !== undefined ? ` (attendance radius: ${radiusMeters} m)` : ""}
            {tooFar
              ? " — that looks outside the radius."
              : rawLooksFar
                ? " — within your GPS accuracy, so it can still count."
                : "."}
          </p>
        ) : null}
      </div>
    );
  }
  return (
    <p role="status" className="flex items-center gap-2 text-sm text-secondary">
      <MapPin className="h-4 w-4 shrink-0" aria-hidden />
      Location not requested yet.
    </p>
  );
}
