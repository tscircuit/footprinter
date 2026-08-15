import { test, expect } from "bun:test"
import { fp } from "../src"

test("to220 uses standard 2.54mm pitch (#790)", () => {
  const circuitJson = fp.string("to220_3").circuitJson()

  const holes = circuitJson.filter((e) => e.type === "pcb_plated_hole") as any[]
  expect(holes.length).toBe(3)

  expect(holes[0].x).toBeCloseTo(-2.54, 3)
  expect(holes[1].x).toBeCloseTo(0, 3)
  expect(holes[2].x).toBeCloseTo(2.54, 3)
})

test("to220 respects custom p parameter", () => {
  const circuitJson = fp.string("to220_3_p3mm").circuitJson()

  const holes = circuitJson.filter((e) => e.type === "pcb_plated_hole") as any[]
  expect(holes.length).toBe(3)

  expect(holes[0].x).toBeCloseTo(-3, 3)
  expect(holes[1].x).toBeCloseTo(0, 3)
  expect(holes[2].x).toBeCloseTo(3, 3)
})
