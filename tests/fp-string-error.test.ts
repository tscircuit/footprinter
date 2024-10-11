import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("fp.string error", () => {
  expect(() => fp.string("nonexistentfn4_p3").circuitJson()).toThrow(
    'Invalid footprint function, got "nonexistentfn", with string "nonexistentfn4_p3"',
  )
})
