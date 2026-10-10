import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("zero pitch throws a clear error instead of emitting NaN pad coordinates", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow(
    /Invalid pitch.*positive pitch/,
  )
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow(
    /Invalid pitch.*positive pitch/,
  )
})

test("explicit zero px/py also throws", () => {
  expect(() => fp.string("lcc_px0mm").circuitJson()).toThrow(/Invalid pitch/)
})

test("zero pitch throws even when w and h are specified (all pads would stack)", () => {
  expect(() => fp.string("lcc_p0mm_w4_h4").circuitJson()).toThrow(
    /Invalid pitch/,
  )
})

test("negative pitch throws instead of silently mirroring pad coordinates", () => {
  // With an explicit body size the falsy `v.p` checks all pass, so before the
  // `<= 0` guard this produced 16 mirrored/stacked pads and no error at all.
  expect(() => fp.string("qfn16_w4_h4_p-0.1mm").circuitJson()).toThrow(
    /Invalid pitch.*positive pitch/,
  )
  expect(() => fp.string("lcc_w9_h9_p-0.5mm").circuitJson()).toThrow(
    /Invalid pitch/,
  )
})

test("explicit negative px/py also throws", () => {
  expect(() => fp.string("lcc_w9_h9_px-0.1mm").circuitJson()).toThrow(
    /Invalid pitch/,
  )
  expect(() => fp.string("lcc_w9_h9_py-0.1mm").circuitJson()).toThrow(
    /Invalid pitch/,
  )
})

test("positive pitch is still accepted", () => {
  const circuitJson = fp.string("qfn16_w4_h4_p0.5mm").circuitJson() as any[]
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(16)
  expect(pads.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y))).toBe(
    true,
  )
})
