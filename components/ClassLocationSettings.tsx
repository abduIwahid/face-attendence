"use client";

import { CheckCircle2, Loader2, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { sampleBestPosition } from "../lib/geolocation";

interface ClassSettingsData {
  class_name: string | null;
  latitude: number;
  longitude: number;
  radius_meters: number;
}

/**
 * Teacher control: set the class location from this device's GPS + the
 * attendance radius (brain/BUILD_PLAN.md Phase 2 addition — the full
 * settings page is Phase 3, but /verify cannot be exercised until a class
 * location exists). Talks to PATCH /api/class-settings, which checks the
 * teacher session server-side (brain/API_SPEC.md).
 */
export default function ClassLocationSettings() {
  const [className, setClassName] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [radius, setRadius] = useState(100);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [samplingAccuracy, setSamplingAccuracy] = useState<number | null>(null);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch("/api/class-settings");
        const payload: unknown = await response.json().catch(() => null);
        if (cancelled) return;
        if (
          payload !== null &&
          typeof payload === "object" &&
          "ok" in payload &&
          payload.ok === true &&
          "data" in payload
        ) {
          const data = payload.data as ClassSettingsData;
          setClassName(data.class_name ?? "");
          setLatitude(data.latitude);
          setLongitude(data.longitude);
          setRadius(data.radius_meters);
        }
      } catch {
        /* an unset class is a normal first-run state */
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Best-of-several sampling (lib/geolocation.ts, ADR-009): the class
   * point anchors every student's check, so it gets the same sampled,
   * most-accurate fix as /verify instead of a single-shot reading.
   */
  async function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      setError("This device cannot provide a location.");
      return;
    }
    setLocating(true);
    setError(null);
    setMessage(null);
    setSamplingAccuracy(null);
    const sampled = await sampleBestPosition({
      onUpdate: (fix) => setSamplingAccuracy(fix.accuracyMeters),
    });
    setSamplingAccuracy(null);
    setLocating(false);
    if (sampled.kind === "ok") {
      setLatitude(sampled.fix.latitude);
      setLongitude(sampled.fix.longitude);
      setGpsAccuracy(sampled.fix.accuracyMeters);
    } else if (sampled.kind === "denied") {
      setError(
        "Location permission was denied. Allow location access in the browser prompt, then try again.",
      );
    } else {
      setError(
        "Location could not be read. Stand near a window, and try again.",
      );
    }
  }

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (latitude === null || longitude === null) {
      setError("Capture the class location first with “Use my current location” while you are standing in the classroom.");
      return;
    }
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const response = await fetch("/api/class-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          class_name: className.trim() === "" ? undefined : className.trim(),
          latitude,
          longitude,
          radius_meters: radius,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);
      if (
        payload !== null &&
        typeof payload === "object" &&
        "ok" in payload &&
        payload.ok === true
      ) {
        setMessage("Class location saved. Students can now mark attendance inside the radius.");
        return;
      }
      const serverMessage =
        payload !== null &&
        typeof payload === "object" &&
        "error" in payload &&
        payload.error !== null &&
        typeof payload.error === "object" &&
        "message" in payload.error &&
        typeof payload.error.message === "string"
          ? payload.error.message
          : "Saving failed. Please try again.";
      setError(serverMessage);
    } catch {
      setError("Saving failed — check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <h2 className="flex items-center gap-2 text-lg font-semibold text-primary">
        <MapPin className="h-5 w-5 text-accent-strong" aria-hidden />
        Class location
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-secondary">
        Stand in the classroom, capture this device&apos;s location, and set
        the radius inside which students may mark attendance. The full
        settings page arrives in Phase 3; this is the working control the
        verify flow needs.
      </p>

      <form onSubmit={handleSave} className="mt-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="className" className="text-sm font-medium text-primary">
            Class name
          </label>
          <input
            id="className"
            type="text"
            value={className}
            onChange={(event) => setClassName(event.target.value)}
            className="min-h-11 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
            placeholder="e.g. FA24-BAI — Demo Class"
          />
        </div>

        <div className="flex flex-wrap items-end gap-4">
          <button
            type="button"
            onClick={handleUseMyLocation}
            disabled={locating}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-base font-semibold text-primary transition-colors hover:bg-surface-muted disabled:opacity-60"
          >
            {locating ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <MapPin className="h-5 w-5" aria-hidden />
            )}
            {locating
              ? samplingAccuracy !== null
                ? `Improving location accuracy… ±${samplingAccuracy} m`
                : "Improving location accuracy…"
              : "Use my current location"}
          </button>
          <p className="text-sm text-secondary" role="status">
            {latitude !== null && longitude !== null
              ? `Location: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}${gpsAccuracy !== null ? ` (±${gpsAccuracy} m)` : ""}`
              : loaded
                ? "No class location set yet."
                : "Loading current settings…"}
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="radius" className="text-sm font-medium text-primary">
            Attendance radius (metres)
          </label>
          <input
            id="radius"
            type="number"
            min={10}
            max={1000}
            step={10}
            value={radius}
            onChange={(event) => setRadius(Number(event.target.value))}
            className="min-h-11 w-40 rounded-lg border border-border bg-surface px-3 text-base text-primary outline-none focus:border-accent focus:ring-2 focus:ring-accent"
          />
          <p className="text-xs text-secondary">Between 10 and 1000 m. Default is 100 m.</p>
        </div>

        {message ? (
          <p role="status" className="flex items-center gap-2 rounded-lg bg-accent-soft px-4 py-3 text-sm font-medium text-accent-strong">
            <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
            {message}
          </p>
        ) : null}
        {error ? (
          <p role="alert" className="rounded-lg bg-danger-soft px-4 py-3 text-sm text-danger">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={saving || latitude === null}
          className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-lg bg-accent px-5 text-base font-semibold text-white transition-colors hover:bg-accent-strong disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-5 w-5 animate-spin" aria-hidden /> : null}
          {saving ? "Saving…" : "Save class location"}
        </button>
      </form>
    </section>
  );
}
