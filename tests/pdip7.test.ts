import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("pdip produces identical circuit json as dip", () => {
  const pdipJson = fp.string("pdip8").circuitJson()
  const dipJson = fp.string("dip8").circuitJson()

  // PDIP is an alias for DIP, so they should produce identical circuit elements
  // Only difference might be internal IDs, so compare structure
  expect(pdipJson.length).toBe(dipJson.length)

  // Compare each element type and position
  for (let i = 0; i < pdipJson.length; i++) {
    const pdipEl = pdipJson[i] as any
    const dipEl = dipJson[i] as any
    expect(pdipEl.type).toBe(dipEl.type)
    if (pdipEl.x !== undefined) expect(pdipEl.x).toBe(dipEl.x)
    if (pdipEl.y !== undefined) expect(pdipEl.y).toBe(dipEl.y)
  }
})
