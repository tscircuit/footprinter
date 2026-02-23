import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("spdip28 matches dip28 geometry parameters", () => {
  const sp = fp.string("spdip28").json()
  const dip = fp.string("dip28").json()

  expect(sp.num_pins).toBe(dip.num_pins)
  expect(sp.w).toBe(dip.w)
  expect(sp.p).toBe(dip.p)
  expect(sp.id).toBe(dip.id)
  expect(sp.od).toBe(dip.od)
})
