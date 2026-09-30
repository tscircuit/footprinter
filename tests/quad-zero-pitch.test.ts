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
