import { test, expect } from "bun:test"
import { plcc } from "../src/fn/plcc"

test("plcc-44", () => {
  const { circuitJson } = plcc({ num_pins: 44, w: 17.5, h: 17.5, p: 1.27, pl: 2, pw: 0.6 })
  
  // Find Pin 1
  const pin1 = circuitJson.find(
    (c) => c.type === "pcb_pad" && c.pcb_pad_number === "1"
  )
  expect(pin1).toBeDefined()
  
  // Pin 1 should be at the top center
  // quad's top side has x from 6.35 to -6.35 (for p=1.27, spc=11, ibw=12.7)
  // center is at x=0
  expect(Math.abs(pin1!.x)).toBeLessThan(0.01)
  expect(pin1!.y).toBeGreaterThan(0)
})

test("plcc-20", () => {
    const { circuitJson } = plcc({ num_pins: 20, w: 10, h: 10, p: 1.27, pl: 2, pw: 0.6 })
    const pin1 = circuitJson.find(
      (c) => c.type === "pcb_pad" && c.pcb_pad_number === "1"
    )
    expect(pin1).toBeDefined()
    expect(Math.abs(pin1!.x)).toBeLessThan(0.01)
    expect(pin1!.y).toBeGreaterThan(0)
})
