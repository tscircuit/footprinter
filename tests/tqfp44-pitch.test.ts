import { test, expect } from "bun:test"
import { fp } from "../src/index"

test("tqfp44 defaults to standard 0.8mm pitch and 0.55mm pad width (#792)", () => {
  const elements = fp.string("tqfp44").circuitJson()
  const smtpads = elements.filter(
    (e: any) => e.type === "pcb_smtpad",
  ) as Array<any>

  expect(smtpads.length).toBe(44)

  const pin1 = smtpads.find((p) => p.port_hints?.includes("1"))!
  const pin2 = smtpads.find((p) => p.port_hints?.includes("2"))!

  expect(pin1).toBeDefined()
  expect(pin2).toBeDefined()

  const pitch = Math.abs(pin1.y - pin2.y)
  expect(pitch).toBeCloseTo(0.8, 2)
  expect(pin1.height).toBeCloseTo(0.55, 2)
  expect(pin1.width).toBeCloseTo(1.475, 2)
})
