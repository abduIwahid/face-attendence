import assert from "node:assert/strict";
import { test } from "node:test";
import { decideVerifyOutcome, type VerifyFacts } from "./verify.ts";

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
    passingFacts({ gpsAccuracyMeters: 51, faceDistance: 0.95 }),
  );
  assert.equal(outcome.kind, "GPS_INACCURATE");
});

test("GPS accuracy exactly at the 50 m cap still passes the gate", () => {
  const outcome = decideVerifyOutcome(passingFacts({ gpsAccuracyMeters: 50 }));
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
  const outcome = decideVerifyOutcome(passingFacts({ distanceMeters: 101 }));
  assert.equal(outcome.kind, "TOO_FAR");
});

test("distance exactly at the radius boundary still passes", () => {
  const outcome = decideVerifyOutcome(passingFacts({ distanceMeters: 100 }));
  assert.equal(outcome.kind, "PRESENT");
});
