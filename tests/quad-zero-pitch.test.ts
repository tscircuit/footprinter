import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("zero pitch on a quad-family footprint does not produce NaN pad coordinates", () => {
  for (const str of ["lcc_p0mm", "qfn16_p0mm"]) {
    let soup: any[] | undefined
    try {
      soup = fp.string(str).circuitJson()
    } catch {
      // Explicitly zero pitch is a degenerate package. Throwing is acceptable,
      // silently emitting NaN/null coordinates into circuit-json is not.
      continue
    }
    const pads = soup.filter((e) => e.type === "pcb_smtpad")
    expect(pads.length).toBeGreaterThan(0)
    for (const pad of pads) {
      expect(Number.isFinite(pad.x)).toBe(true)
      expect(Number.isFinite(pad.y)).toBe(true)
    }
  }
})
