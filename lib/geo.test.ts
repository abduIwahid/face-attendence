import assert from "node:assert/strict";
import { test } from "node:test";
import { haversineMeters, isGpsAccurate, isWithinRadius } from "./geo.ts";

// Run with: node --test lib/geo.test.ts   (Node ≥ 23 strips types natively)

test("haversine: same point is 0 m", () => {
  const p = { latitude: 33.7731, longitude: 72.3519 };
  assert.equal(haversineMeters(p, p), 0);
});

test("haversine: 1 degree of longitude at the equator ≈ 111,195 m", () => {
  const d = haversineMeters(
    { latitude: 0, longitude: 0 },
    { latitude: 0, longitude: 1 },
  );
  assert.ok(Math.abs(d - 111_195) <= 1, `got ${d}`);
});

test("haversine: 1 degree of latitude ≈ 111,195 m", () => {
  const d = haversineMeters(
    { latitude: 0, longitude: 0 },
    { latitude: 1, longitude: 0 },
  );
  assert.ok(Math.abs(d - 111_195) <= 1, `got ${d}`);
});

test("isWithinRadius: boundary is inclusive", () => {
  assert.equal(isWithinRadius(100, 100), true);
  assert.equal(isWithinRadius(101, 100), false);
});

test("isGpsAccurate: default cap is 250 m (ADR-009)", () => {
  assert.equal(isGpsAccurate(250), true);
  assert.equal(isGpsAccurate(251), false);
  assert.equal(isGpsAccurate(80, 100), true);
});
