import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder ignores empty segments", () => {
  expect(() => fp.string("0603__").circuitJson()).not.toThrow()
})

test("invalid footprint function error identifies the missing function", () => {
  expect(() => fp.string("invalid").circuitJson()).toThrow(
    'Function not found for footprinter "invalid". Specify a valid function like .dip, .lr, .p etc.',
  )
})
