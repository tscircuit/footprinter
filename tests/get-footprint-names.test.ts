import { test, expect } from "bun:test"
import { getFootprintNames } from "../src/footprinter"

test("getFootprintNames returns correct categorization", () => {
  const result = getFootprintNames()

  expect(result.passiveFootprints).toContain("res")
  expect(result.passiveFootprints).toContain("cap")
  expect(result.passiveFootprints).toContain("diode")
  expect(result.passiveFootprints).toContain("led")

  expect(result.normalFootprints).toContain("dip")
  expect(result.normalFootprints).toContain("soic")
  expect(result.normalFootprints).toContain("qfp")
  expect(result.normalFootprints).not.toContain("res")
  expect(result.normalFootprints).not.toContain("cap")
  expect(result.normalFootprints).not.toContain("diode")
  expect(result.normalFootprints).not.toContain("led")
})
