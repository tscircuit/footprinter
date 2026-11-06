import { expect, test } from "bun:test"
import { fp } from "src/footprinter"

test("fp.string error", () => {
  expect(() => fp.string("nonexistentfn4_p3").circuitJson()).toThrow(
    'Function not found for footprinter "nonexistentfn", from string "nonexistentfn4_p3". Specify a valid function like .dip, .lr, .p, etc.',
  )
})

test("fp builder error when no footprint function is selected", () => {
  expect(() => fp().soup()).toThrow(
    "Function not found for footprinter no function. Specify a valid function like .dip, .lr, .p, etc.",
  )
})
