import { describe, expect, it } from "bun:test"
import { fp } from "../src/footprinter"

describe("all-fixes", () => {
  it("pdip8 should have 8 pins (#371)", () => {
    const circuitJson = fp().pdip8().circuitJson()
    const pins = circuitJson.filter((e) => e.type === "pcb_plated_hole")
    expect(pins.length).toBe(8)
  })

  it("jst_ph_4 should have 4 pins (#495)", () => {
    const circuitJson = fp.string("jst_ph_4").circuitJson()
    const pads = circuitJson.filter((e) => e.type === "pcb_plated_hole")
    expect(pads.length).toBe(4)
  })
})
