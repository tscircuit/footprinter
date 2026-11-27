import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("better footprint errors - invalid builder function", () => {
  expect(() => (fp() as any).invalid().circuitJson()).toThrow(
    'Function not found for footprinter "invalid". Specify a valid function like .dip, .lr, .p etc.',
  )

  expect(() => (fp() as any).invalid().soup()).toThrow(
    'Function not found for footprinter "invalid". Specify a valid function like .dip, .lr, .p etc.',
  )

  expect(() => (fp() as any).invalid().json()).toThrow(
    'Function not found for footprinter "invalid". Specify a valid function like .dip, .lr, .p etc.',
  )
})

test("better footprint errors - missing footprint function", () => {
  expect(() => (fp() as any).circuitJson()).toThrow(
    "Function not found for footprinter. Specify a valid function like .dip, .lr, .p etc.",
  )

  expect(() => (fp() as any).soup()).toThrow(
    "Function not found for footprinter. Specify a valid function like .dip, .lr, .p etc.",
  )

  expect(() => (fp() as any).json()).toThrow(
    "Function not found for footprinter. Specify a valid function like .dip, .lr, .p etc.",
  )
})

test("fp.string error preserves string details", () => {
  expect(() => fp.string("nonexistentfn4_p3").circuitJson()).toThrow(
    'Invalid footprint function, got "nonexistentfn", from string "nonexistentfn4_p3"',
  )
})
