import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

/**
 * Hyphenated package names are the standard format found in datasheets and
 * part catalogs (e.g. SOT-23, TO-220, SOD-123). The string parser should
 * treat them identically to the concatenated form (sot23, to220, sod123).
 *
 * This test covers representative examples from each package family.
 */

const getPadCount = (circuitJson: any[]): number =>
  circuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  ).length

test("hyphenated SOT family resolves like concatenated form", () => {
  // SOT-23 (basic), SOT-223-5 (with pin count), SOT-89 (two digits)
  expect(getPadCount(fp.string("sot-23").circuitJson())).toBe(
    getPadCount(fp.string("sot23").circuitJson()),
  )
  expect(getPadCount(fp.string("sot-223-5").circuitJson())).toBe(
    getPadCount(fp.string("sot223_5").circuitJson()),
  )
  expect(getPadCount(fp.string("sot-89").circuitJson())).toBe(
    getPadCount(fp.string("sot89").circuitJson()),
  )
  expect(getPadCount(fp.string("sot-323").circuitJson())).toBe(
    getPadCount(fp.string("sot323").circuitJson()),
  )
  expect(getPadCount(fp.string("sot-563").circuitJson())).toBe(
    getPadCount(fp.string("sot563").circuitJson()),
  )
  expect(getPadCount(fp.string("sot-963").circuitJson())).toBe(
    getPadCount(fp.string("sot963").circuitJson()),
  )
})
