import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("hyphenated names with extra parameters resolve correctly", () => {
  expect(getPadCount(fp.string("soic-8_w5.3mm").circuitJson())).toBe(
    getPadCount(fp.string("soic8_w5.3mm").circuitJson()),
  )
  expect(getPadCount(fp.string("dip-8_w7.62mm").circuitJson())).toBe(
    getPadCount(fp.string("dip8_w7.62mm").circuitJson()),
  )
})
