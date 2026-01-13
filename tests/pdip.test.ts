import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8 footprint", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8 parameters match dip8", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()

  // PDIP should have same parameters as DIP (except fn name)
  expect(pdipJson.num_pins).toBe(dipJson.num_pins)
  expect(pdipJson.w).toBe(dipJson.w)
  expect(pdipJson.p).toBe(dipJson.p)
  expect(pdipJson.id).toBe(dipJson.id)
  expect(pdipJson.od).toBe(dipJson.od)
})

test("pdip14 footprint", () => {
  const circuitJson = fp.string("pdip14").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip14")
})

test("pdip16 footprint", () => {
  const circuitJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip16")
})

test("pdip8_wide footprint", () => {
  const circuitJson = fp
    .string("pdip8_wide")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8_wide")
})

test("PDIP8 string resolves using lowercase function", () => {
  const uppercaseJson = fp.string("PDIP8").json()
  const lowercaseJson = fp.string("pdip8").json()
  expect(uppercaseJson).toEqual(lowercaseJson)
})
