import { describe, expect, it } from "bun:test"
import { fp } from "../src/footprinter"

describe("pdip", () => {
  it("pdip8 should have 8 pins and correct dimensions", () => {
    const circuitJson = fp.pdip8().circuitJson()
    const pins = circuitJson.filter((e) => e.type === "pcb_plated_hole")
    expect(pins.length).toBe(8)

    // Check pitch (2.54mm) and width (7.62mm)
    // Pin 1 at (-3.81, 3.81), Pin 2 at (-3.81, 1.27)
    const pin1 = pins.find((p: any) => p.pin_number === 1) as any
    const pin2 = pins.find((p: any) => p.pin_number === 2) as any
    const pin8 = pins.find((p: any) => p.pin_number === 8) as any

    expect(Math.abs(pin1.x - -3.81)).toBeLessThan(0.01)
    expect(Math.abs(pin1.y - 3.81)).toBeLessThan(0.01)
    expect(Math.abs(pin2.y - 1.27)).toBeLessThan(0.01)
    expect(Math.abs(pin8.x - 3.81)).toBeLessThan(0.01)
  })

  it("pdip should work with custom pin count", () => {
    const circuitJson = fp.pdip(14).circuitJson()
    const pins = circuitJson.filter((e) => e.type === "pcb_plated_hole")
    expect(pins.length).toBe(14)
  })
})
