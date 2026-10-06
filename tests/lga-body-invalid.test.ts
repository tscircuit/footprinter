import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { lga_def } from "../src/fn/lga"

test("lga rejects nonpositive, nonfinite, or missing body dimension values", () => {
  for (const key of ["bodywidth", "bodyheight", "bodythickness"] as const) {
    for (const value of [0, -1, Infinity, NaN, "bogus"]) {
      expect(() => lga_def.parse({ fn: "lga", [key]: value })).toThrow()
    }
    for (const value of ["0mm", "-1mm", ""]) {
      expect(() =>
        fp
          .string(
            "lga16_grid5x3_p0.5mm_w3.6mm_h3.6mm_pw0.28mm_pl0.8mm_" +
              key +
              value,
          )
          .circuitJson(),
      ).toThrow()
    }
  }
})
