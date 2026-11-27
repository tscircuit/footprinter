import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("zero pitch on quad-family footprints throws instead of emitting NaN coordinates", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow(
    /pitch must be a number greater than 0/,
  )
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow(
    /pitch must be a number greater than 0/,
  )
  expect(() => fp.string("qfn16_px0mm").circuitJson()).toThrow(
    /pitch must be a number greater than 0/,
  )
})

test("valid quad-family footprints still produce finite pad coordinates", () => {
  for (const footprint of ["lcc", "qfn16", "qfn16_p0.4mm", "lcc_p1mm"]) {
    const soup = fp.string(footprint).circuitJson()
    const pad = soup.find((e) => e.type === "pcb_smtpad") as any
    expect(pad).toBeDefined()
    expect(Number.isFinite(pad.x)).toBe(true)
    expect(Number.isFinite(pad.y)).toBe(true)
  }
})
