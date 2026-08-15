import { test, expect } from "bun:test"
import { fp } from "../src"

test("solderjumper bare string defaults to 2 pins and emits finite geometry (#784)", () => {
  const circuitJson = fp.string("solderjumper").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(2)

  const courtyard = circuitJson.find((e) => e.type === "pcb_courtyard_rect") as any
  expect(courtyard).toBeDefined()
  expect(Number.isFinite(courtyard.width)).toBe(true)
  expect(Number.isFinite(courtyard.height)).toBe(true)
  expect(Number.isFinite(courtyard.center.x)).toBe(true)
  expect(Number.isFinite(courtyard.center.y)).toBe(true)

  const text = circuitJson.find((e) => e.type === "pcb_silkscreen_text") as any
  if (text) {
    expect(Number.isFinite(text.anchor_position.x)).toBe(true)
    expect(Number.isFinite(text.anchor_position.y)).toBe(true)
  }
})
