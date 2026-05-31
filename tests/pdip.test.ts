import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8 string resolves to dip8", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()
  expect(pdipJson).toEqual(dipJson)
})

test("PDIP-8 string resolves to dip8", () => {
  const pdipJson = fp.string("PDIP-8").json()
  const dipJson = fp.string("dip8").json()
  expect(pdipJson).toEqual(dipJson)
})

test("pdip8 SVG snapshot", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

