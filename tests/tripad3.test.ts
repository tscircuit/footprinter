import { test, expect } from "bun:test"
import { tripad } from "../src/fn/tripad"

test("tripad pin numbering", () => {
  const result = tripad({ fn: "tripad" })
  const pads = result.circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(3)

  // Pin 1 is top-left small pad (highest y)
  const pin1 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
  )
  const pin2 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("2"),
  )
  const pin3 = pads.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("3"),
  )

  expect(pin1).toBeDefined()
  expect(pin2).toBeDefined()
  expect(pin3).toBeDefined()

  // Pin 1 and 3 are on the left (negative x), pin 2 is on the right (positive x)
  if (pin1 && pin2 && pin3) {
    expect((pin1 as any).x).toBeLessThan((pin2 as any).x)
    expect((pin3 as any).x).toBeLessThan((pin2 as any).x)
    // Pin 1 is above pin 3
    expect((pin1 as any).y).toBeGreaterThan((pin3 as any).y)
    // Pin 2 (large pad) is centered vertically
    expect((pin2 as any).y).toBe(0)
    // Large pad is bigger than small pads
    expect((pin2 as any).width).toBeGreaterThan((pin1 as any).width)
    expect((pin2 as any).height).toBeGreaterThan((pin1 as any).height)
  }
})
