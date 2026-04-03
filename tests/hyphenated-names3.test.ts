import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("hyphenated SOD family resolves like concatenated form", () => {
  expect(getPadCount(fp.string("sod-123").circuitJson())).toBe(
    getPadCount(fp.string("sod123").circuitJson()),
  )
  expect(getPadCount(fp.string("sod-323").circuitJson())).toBe(
    getPadCount(fp.string("sod323").circuitJson()),
  )
  expect(getPadCount(fp.string("sod-523").circuitJson())).toBe(
    getPadCount(fp.string("sod523").circuitJson()),
  )
  expect(getPadCount(fp.string("sod-80").circuitJson())).toBe(
    getPadCount(fp.string("sod80").circuitJson()),
  )
  expect(getPadCount(fp.string("sod-882").circuitJson())).toBe(
    getPadCount(fp.string("sod882").circuitJson()),
  )
  expect(getPadCount(fp.string("sod-123f").circuitJson())).toBe(
    getPadCount(fp.string("sod123f").circuitJson()),
  )
})
