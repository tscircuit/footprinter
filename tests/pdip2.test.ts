import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("pdip8 parameters match dip8", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()

  // PDIP should have same parameters as DIP (except fn name)
  expect(pdipJson.num_pins).toBe(dipJson.num_pins)
  expect(pdipJson.w).toBe(dipJson.w)
  expect(pdipJson.p).toBe(dipJson.p)
  expect(pdipJson.id).toBe(dipJson.id)
  expect(pdipJson.od).toBe(dipJson.od)
})
