import assert from "node:assert/strict";
import { test } from "node:test";
import {
  decideVerifyOutcome,
  effectiveDistanceMeters,
  type VerifyFacts,
} from "./verify.ts";

// Run with: node --test lib/verify.test.ts   (Node ≥ 23 strips types natively)

/** A fully-passing attempt; each test overrides one fact. */
function passingFacts(overrides: Partial<VerifyFacts> = {}): VerifyFacts {
  return {
    rateLimited: false,
    registered: true,
    alreadyMarkedToday: false,
    gpsAccuracyMeters: 12,
    faceDistance: 0.32,
    distanceMeters: 24,
    radiusMeters: 100,
    ...overrides,
  };
}

test("effectiveDistanceMeters subtracts accuracy and floors at 0", () => {
  assert.equal(effectiveDistanceMeters(165, 160), 5);
  assert.equal(effectiveDistanceMeters(300, 170), 130);
  assert.equal(effectiveDistanceMeters(100, 250), 0);
});

test("PRESENT when every check passes", () => {
  assert.equal(decideVerifyOutcome(passingFacts()).kind, "PRESENT");
});

test("ordering: rate limit beats everything, even an unregistered roll", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ rateLimited: true, registered: false }),
  );
  assert.equal(outcome.kind, "RATE_LIMITED");
});

test("ordering: NOT_REGISTERED beats ALREADY_MARKED and GPS failures", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({
      registered: false,
      alreadyMarkedToday: true,
      gpsAccuracyMeters: 900,
      faceDistance: null,
      distanceMeters: null,
    }),
  );
  assert.equal(outcome.kind, "NOT_REGISTERED");
});

test("ordering: ALREADY_MARKED beats GPS and face failures", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({
      alreadyMarkedToday: true,
      gpsAccuracyMeters: 900,
      faceDistance: 0.95,
    }),
  );
  assert.equal(outcome.kind, "ALREADY_MARKED");
});

test("ordering: GPS_INACCURATE beats a face mismatch", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ gpsAccuracyMeters: 300, faceDistance: 0.95 }),
  );
  assert.equal(outcome.kind, "GPS_INACCURATE");
});

test("GPS accuracy exactly at the 250 m cap still passes the gate", () => {
  const outcome = decideVerifyOutcome(passingFacts({ gpsAccuracyMeters: 250 }));
  assert.equal(outcome.kind, "PRESENT");
});

test("GPS accuracy of 260 m is rejected as GPS_INACCURATE (ADR-009)", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ gpsAccuracyMeters: 260, distanceMeters: 5 }),
  );
  assert.equal(outcome.kind, "GPS_INACCURATE");
});

test("Wadi's case: raw 165 m with ±160 m accuracy inside a 100 m radius is PRESENT (ADR-009)", () => {
  // Sitting in the exact class spot, an indoor fix reported ~165 m away
  // with ~160 m accuracy — effective distance is 5 m, not 165 m.
  const outcome = decideVerifyOutcome(
    passingFacts({ distanceMeters: 165, gpsAccuracyMeters: 160, radiusMeters: 100 }),
  );
  assert.equal(outcome.kind, "PRESENT");
  if (outcome.kind === "PRESENT") {
    // The outcome still carries the RAW distance for storage/display.
    assert.equal(outcome.distanceMeters, 165);
  }
});

test("raw 300 m with ±170 m accuracy is still TOO_FAR (effective 130 m > 100 m radius)", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ distanceMeters: 300, gpsAccuracyMeters: 170, radiusMeters: 100 }),
  );
  assert.equal(outcome.kind, "TOO_FAR");
});

test("effective distance exactly at the radius boundary still passes", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ distanceMeters: 200, gpsAccuracyMeters: 100, radiusMeters: 100 }),
  );
  assert.equal(outcome.kind, "PRESENT");
});

test("ordering: FACE_NOT_MATCHED beats TOO_FAR", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ faceDistance: 0.85, distanceMeters: 4_000 }),
  );
  assert.equal(outcome.kind, "FACE_NOT_MATCHED");
});

test("face distance exactly at the 0.6 threshold does not match", () => {
  const outcome = decideVerifyOutcome(passingFacts({ faceDistance: 0.6 }));
  assert.equal(outcome.kind, "FACE_NOT_MATCHED");
});

test("TOO_FAR when the face matches but the student is outside the radius", () => {
  // Accuracy 0 keeps the effective distance equal to the raw distance.
  const outcome = decideVerifyOutcome(
    passingFacts({ distanceMeters: 101, gpsAccuracyMeters: 0 }),
  );
  assert.equal(outcome.kind, "TOO_FAR");
});

test("raw distance exactly at the radius boundary still passes", () => {
  const outcome = decideVerifyOutcome(
    passingFacts({ distanceMeters: 100, gpsAccuracyMeters: 0 }),
  );
  assert.equal(outcome.kind, "PRESENT");
});
