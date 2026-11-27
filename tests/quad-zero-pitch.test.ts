import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("quad-family rejects explicit zero pitch instead of emitting NaN pads", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow(/pitch/i)
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow(/pitch/i)
})

test("valid lcc pitch still produces finite pad coordinates", () => {
  const soup = fp.string("lcc68_w24.2_h24.2_p1.27mm").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  expect(pads.length).toBeGreaterThan(0)
  for (const pad of pads) {
    expect(Number.isFinite(pad.x)).toBe(true)
    expect(Number.isFinite(pad.y)).toBe(true)
  }
})
