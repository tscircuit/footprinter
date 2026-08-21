import { test, expect } from "bun:test"
import { fp } from "../src/index"

test("lcc defaults to standard 1.27mm pitch without overlapping pads (#794)", () => {
  const elements = fp.string("lcc44").circuitJson()
  const smtpads = elements.filter(
    (e: any) => e.type === "pcb_smtpad",
  ) as Array<any>

  expect(smtpads.length).toBe(44)

  // Pin 1 and Pin 2 on the left side
  const pin1 = smtpads.find((p) => p.port_hints?.includes("1"))!
  const pin2 = smtpads.find((p) => p.port_hints?.includes("2"))!

  expect(pin1).toBeDefined()
  expect(pin2).toBeDefined()

  const pitch = Math.abs(pin1.y - pin2.y)
  expect(pitch).toBeCloseTo(1.27, 2)
  expect(pin1.height).toBeLessThanOrEqual(pitch)
})
