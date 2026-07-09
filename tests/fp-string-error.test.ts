import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("fp.string error", () => {
  expect(() => fp.string("nonexistentfn4_p3").circuitJson()).toThrow(
    'Function not found for footprinter "nonexistentfn". Specify a valid function like .dip, .lr, .p etc.',
  )
})
