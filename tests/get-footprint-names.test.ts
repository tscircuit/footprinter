import { test, expect } from "bun:test"
import { getFootprintNames, getFootprintNamesByType } from "../src/footprinter"

test("getFootprintNames returns all footprint names", () => {
  const footprintNames = getFootprintNames()
  expect(footprintNames).toContain("res")
  expect(footprintNames).toContain("cap")
  expect(footprintNames).toContain("dip")
  expect(footprintNames).toContain("soic")
})

test("getFootprintNamesByType groups footprint names by component type", () => {
  const { passiveFootprints, normalFootprints } = getFootprintNamesByType()

  expect(passiveFootprints).toContain("res")
  expect(passiveFootprints).toContain("cap")
  expect(passiveFootprints).toContain("diode")
  expect(passiveFootprints).toContain("led")

  expect(normalFootprints).toContain("dip")
  expect(normalFootprints).toContain("soic")
  expect(normalFootprints).toContain("qfp")
  expect(normalFootprints).not.toContain("res")
  expect(normalFootprints).not.toContain("cap")
  expect(normalFootprints).not.toContain("diode")
  expect(normalFootprints).not.toContain("led")
})
