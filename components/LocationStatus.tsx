import { AlertTriangle, CheckCircle2, Loader2, MapPin } from "lucide-react";

export type LocationState =
  | "idle"
  | "requesting"
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
 */
export default function LocationStatus({
  state,
  accuracyMeters,
  distanceMeters,
  radiusMeters,
}: LocationStatusProps) {
  if (state === "requesting") {
    return (
      <p role="status" className="flex items-center gap-2 text-sm text-secondary">
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
        Getting your location…
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
        (it needs to be ±50 m or better). Stand near a window and share your
        location again.
      </p>
    );
  }
  if (state === "ok") {
    const tooFar =
      distanceMeters !== null &&
      distanceMeters !== undefined &&
      radiusMeters !== undefined &&
      distanceMeters > radiusMeters;
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
            {tooFar ? " — that looks outside the radius." : "."}
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
