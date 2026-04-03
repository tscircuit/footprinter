import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("uppercase hyphenated names resolve correctly", () => {
  expect(getPadCount(fp.string("SOT-23").circuitJson())).toBe(
    getPadCount(fp.string("sot23").circuitJson()),
  )
  expect(getPadCount(fp.string("TO-92").circuitJson())).toBe(
    getPadCount(fp.string("to92").circuitJson()),
  )
  expect(getPadCount(fp.string("SOD-123").circuitJson())).toBe(
    getPadCount(fp.string("sod123").circuitJson()),
  )
  expect(getPadCount(fp.string("SOIC-8").circuitJson())).toBe(
    getPadCount(fp.string("soic8").circuitJson()),
  )
})
