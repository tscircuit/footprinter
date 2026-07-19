import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8 matches dip8 with same defaults", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()

  expect(pdipJson.num_pins).toBe(8)
  expect(pdipJson.w).toBe(dipJson.w)
  expect(pdipJson.p).toBe(dipJson.p)
  expect(pdipJson.id).toBe(dipJson.id)
  expect(pdipJson.od).toBe(dipJson.od)
})

test("pdip8 with custom width", () => {
  const circuitJson = fp
    .string("pdip8_w7.62mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8_w7.62mm")
})

test("pdip14", () => {
  const circuitJson = fp.string("pdip14").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip14")
})
