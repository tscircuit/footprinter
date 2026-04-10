import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("hyphenated TO family resolves like concatenated form", () => {
  expect(getPadCount(fp.string("to-92").circuitJson())).toBe(
    getPadCount(fp.string("to92").circuitJson()),
  )
  expect(getPadCount(fp.string("to-220").circuitJson())).toBe(
    getPadCount(fp.string("to220").circuitJson()),
  )
  expect(getPadCount(fp.string("to-220f-3").circuitJson())).toBe(
    getPadCount(fp.string("to220f_3").circuitJson()),
  )
})
