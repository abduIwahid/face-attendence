import assert from "node:assert/strict";
import { test } from "node:test";
import {
  FACE_MATCH_THRESHOLD,
  euclideanDistance,
  isFaceMatch,
} from "./matching.ts";

// Run with: node --test lib/matching.test.ts   (Node ≥ 23 strips types natively)

function descriptor(firstValues: number[]): number[] {
  const values = new Array(128).fill(0);
  firstValues.forEach((value, index) => {
    values[index] = value;
  });
  return values;
}

test("euclideanDistance: identical descriptors are 0", () => {
  const d = descriptor([0.25, -0.5, 0.75]);
  assert.equal(euclideanDistance(d, d), 0);
});

test("euclideanDistance: 3-4-5 triangle across two dimensions", () => {
  const a = descriptor([0, 0]);
  const b = descriptor([3, 4]);
  assert.equal(euclideanDistance(a, b), 5);
  assert.equal(euclideanDistance(b, a), 5);
});

test("euclideanDistance: mismatched lengths throw", () => {
  assert.throws(() => euclideanDistance([1, 2], [1, 2, 3]));
});

test("isFaceMatch: ADR-006 threshold boundaries (0.6, strict)", () => {
  assert.equal(FACE_MATCH_THRESHOLD, 0.6);
  assert.equal(isFaceMatch(0.59), true);
  assert.equal(isFaceMatch(0.6), false);
  assert.equal(isFaceMatch(0.61), false);
  assert.equal(isFaceMatch(0), true);
});

test("isFaceMatch: custom threshold is honoured", () => {
  assert.equal(isFaceMatch(0.45, 0.5), true);
  assert.equal(isFaceMatch(0.5, 0.5), false);
});
