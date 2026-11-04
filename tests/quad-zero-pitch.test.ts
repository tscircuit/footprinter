import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("lcc with zero pitch throws a clear error", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow(
    /pitch must be a positive number/,
  )
})

test("qfn16 with zero pitch throws a clear error", () => {
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow(
    /pitch must be a positive number/,
  )
})

test("quad with zero px throws a clear error", () => {
  expect(() => fp.string("quad16_w4_h4_p0.5mm_px0mm").circuitJson()).toThrow(
    /pitch must be a positive number/,
  )
})

test("normal pitch still works", () => {
  const soup = fp.string("quad16_w4_l4_p0.4_pw0.25_pl0.4").circuitJson()
  const pads = soup.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBeGreaterThan(0)
  for (const pad of pads) {
    expect(Number.isNaN(pad.x)).toBe(false)
    expect(Number.isNaN(pad.y)).toBe(false)
  }
})
