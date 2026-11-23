/**
 * Location math for the verify flow — own util, no dependency
 * (brain/ARCHITECTURE.md). Pure functions; unit-tested in `geo.test.ts`.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance between two points, in whole meters. */
export function haversineMeters(a: Coordinates, b: Coordinates): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLng = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);

  const h =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const centralAngle = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return Math.round(EARTH_RADIUS_METERS * centralAngle);
}

/** True when the measured distance is inside the class radius. */
export function isWithinRadius(distanceMeters: number, radiusMeters: number): boolean {
  return distanceMeters <= radiusMeters;
}

/**
 * GPS accuracy guard (brain/SECURITY.md): a fix coarser than the cap is not
 * a location proof. The verify route rejects with GPS_INACCURATE above it.
 */
export function isGpsAccurate(accuracyMeters: number, capMeters = 50): boolean {
  return accuracyMeters <= capMeters;
}
