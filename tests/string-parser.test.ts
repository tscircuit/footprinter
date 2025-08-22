import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder ignores empty segments", () => {
  expect(() => fp.string("0603__").circuitJson()).not.toThrow()
})
