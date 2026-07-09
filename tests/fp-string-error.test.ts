import { expect, test } from "bun:test"
import { fp } from "src/footprinter"

test("fp.string error", () => {
  expect(() => fp.string("nonexistentfn4_p3").circuitJson()).toThrow(
    'Function not found for footprinter "nonexistentfn". Specify a valid function like .dip, .lr, .p etc. From string "nonexistentfn4_p3".',
  )
})

test("fluent invalid function error names the missing function", () => {
  expect(() => fp().invalid().circuitJson()).toThrow(
    'Function not found for footprinter "invalid". Specify a valid function like .dip, .lr, .p etc.',
  )
})

test("empty footprinter error asks for a valid function", () => {
  expect(() => fp().circuitJson()).toThrow(
    "No footprint function selected. Specify a valid function like .dip, .lr, .p etc.",
  )
})
