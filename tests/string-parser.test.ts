import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder ignores empty segments", () => {
  expect(() => fp.string("0603__").circuitJson()).not.toThrow()
})

test("string builder works for led and diode imperial sizes", () => {
  const led0402 = fp.string("led0402").circuitJson()
  expect(led0402.some((e) => e.type === "pcb_pad")).toBe(true)
  // Check for cathode marking (stroke_width 0.2)
  expect(
    led0402.some(
      (e) => e.type === "pcb_silkscreen_path" && e.stroke_width === 0.2,
    ),
  ).toBe(true)

  const diode0603 = fp.string("diode0603").circuitJson()
  expect(diode0603.some((e) => e.type === "pcb_pad")).toBe(true)
  expect(
    diode0603.some(
      (e) => e.type === "pcb_silkscreen_path" && e.stroke_width === 0.2,
    ),
  ).toBe(true)
})
