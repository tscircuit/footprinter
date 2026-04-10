import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("hyphenated IC packages resolve like concatenated form", () => {
  expect(getPadCount(fp.string("soic-8").circuitJson())).toBe(
    getPadCount(fp.string("soic8").circuitJson()),
  )
  expect(getPadCount(fp.string("dip-8").circuitJson())).toBe(
    getPadCount(fp.string("dip8").circuitJson()),
  )
  expect(getPadCount(fp.string("qfn-32").circuitJson())).toBe(
    getPadCount(fp.string("qfn32").circuitJson()),
  )
  expect(getPadCount(fp.string("tssop-16").circuitJson())).toBe(
    getPadCount(fp.string("tssop16").circuitJson()),
  )
  expect(getPadCount(fp.string("lqfp-48").circuitJson())).toBe(
    getPadCount(fp.string("lqfp48").circuitJson()),
  )
  expect(getPadCount(fp.string("ms-012").circuitJson())).toBe(
    getPadCount(fp.string("ms012").circuitJson()),
  )
})
