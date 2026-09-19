import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { ssop_def } from "../src/fn/ssop"

test("ssop rejects nonpositive, nonfinite, or missing body dimension values", () => {
  for (const key of ["bodywidth", "bodyheight", "bodythickness"] as const) {
    for (const value of [0, -1, Infinity, NaN, "bogus"]) {
      expect(() => ssop_def.parse({ fn: "ssop", [key]: value })).toThrow()
    }
    for (const value of ["0mm", "-1mm", ""]) {
      expect(() =>
        fp.string("ssop28_p0.65mm_w8.93mm_" + key + value).circuitJson(),
      ).toThrow()
    }
  }
})
