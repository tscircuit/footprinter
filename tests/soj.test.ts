import { test, expect } from "bun:test"
import { soj } from "../src/fn/soj"

test("soj-20", () => {
  const { circuitJson, parameters } = soj({ num_pins: 20, w: 7.62, p: 1.27, pl: 1, pw: 0.6 })
  
  // Find Pin 1
  const pin1 = circuitJson.find(
    (c) => c.type === "pcb_pad" && c.pcb_pad_number === "1"
  )
  expect(pin1).toBeDefined()
  
  // Pin 1 should be on the left side
  expect(pin1!.x).toBeLessThan(0)
  
  // J-leads are inside the width: -w/2 + pl/2
  // -7.62/2 + 0.5 = -3.81 + 0.5 = -3.31
  expect(Math.abs(pin1!.x + 3.31)).toBeLessThan(0.01)
})
