import { expect, test } from "bun:test"
import { fp } from "../src"

test("zero pitch on quad-family footprints throws clear error instead of producing NaN (tscircuit/footprinter#871)", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow()
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow()
})
