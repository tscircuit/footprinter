import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

// Regression: at small pitches (e.g. 1.27 mm for ARM Cortex Debug
// headers), the previous hardcoded defaults id=1.0 mm / od=1.5 mm
// produced overlapping plated-hole pads (1.5 mm OD on 1.27 mm pitch =
// −0.23 mm copper-to-copper clearance — fab-breaking).
//
// New behaviour: id/od defaults are derived from pitch when the user
// doesn't specify them. The 2.54 mm default pitch still yields the
// historical id=1.0 mm / od=1.5 mm.

test("default pitch (2.54 mm) keeps id=1.0 / od=1.5 (backward compat)", () => {
  const json = fp.string("pinrow5").json() as any
  expect(json.p).toBe(2.54)
  expect(json.od).toBe(1.5)
  expect(json.id).toBe(1)
})

test("p=1.27mm default od/id scale down so pads do not overlap", () => {
  const json = fp.string("pinrow10_p1.27mm_rows2").json() as any
  expect(json.p).toBe(1.27)
  // od must be ≤ pitch − some clearance
  expect(json.od).toBeLessThanOrEqual(json.p - 0.2)
  // id must leave a usable annular ring
  expect(json.id).toBeLessThan(json.od)
  expect(json.od - json.id).toBeGreaterThanOrEqual(0.3)
})

test("explicit od/id override defaults at any pitch", () => {
  const json = fp.string("pinrow5_p1.27mm_id0.6mm_od1.0mm").json() as any
  expect(json.p).toBe(1.27)
  expect(json.id).toBe(0.6)
  expect(json.od).toBe(1)
})
