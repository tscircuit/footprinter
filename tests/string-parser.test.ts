import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder ignores empty segments", () => {
  expect(() => fp.string("0603__").circuitJson()).not.toThrow()
})

test("string builder parses negative parameter values", () => {
  expect(fp.string("rj45_holey-3.43mm").json().holey).toBe(-3.43)
})
