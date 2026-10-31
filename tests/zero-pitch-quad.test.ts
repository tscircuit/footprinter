import { test, expect } from "bun:test"
import { fp } from "../src"

test("zero pitch on quad-family footprints throws explicit validation error (fixes #871)", () => {
  expect(() => {
    fp.string("lcc_p0mm").circuitJson()
  }).toThrow(/pitch must be a positive finite length/)

  expect(() => {
    fp.string("qfn16_p0mm").circuitJson()
  }).toThrow(/pitch must be a positive finite length/)

  expect(() => {
    fp.string("tqfp32_p0mm").circuitJson()
  }).toThrow(/pitch must be a positive finite length/)
})
