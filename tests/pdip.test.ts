import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement, PcbPlatedHole } from "circuit-json"

test("pdip-8 string resolves to standard 8-pin DIP footprint", () => {
  const formats = ["pdip8", "pdip-8", "PDIP-8", "pdip_8"]
  
  for (const fmt of formats) {
    const circuitJson = fp.string(fmt).circuitJson() as AnyCircuitElement[]
    const platedHoles = circuitJson.filter(
      (e): e is PcbPlatedHole => e.type === "pcb_plated_hole"
    )
    
    expect(platedHoles.length).toBe(8)
    
    // Standard DIP spacing: 2.54mm pitch (100mil) and 7.62mm width (300mil)
    // Left row x should be -3.81, Right row x should be +3.81
    const pin1 = platedHoles.find((h) => (h as any).port_hints?.includes("1") || (h as any).pn === 1)
    expect(pin1).toBeDefined()
    expect(pin1!.x).toBeCloseTo(-3.81, 2)
  }
})

test("fp().pdip(8) builder resolves to 8-pin DIP footprint", () => {
  const circuitJson = fp().pdip(8).circuitJson() as AnyCircuitElement[]
  const platedHoles = circuitJson.filter(
    (e): e is PcbPlatedHole => e.type === "pcb_plated_hole"
  )
  expect(platedHoles.length).toBe(8)
})
