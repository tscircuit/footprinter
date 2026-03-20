import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8 produces same circuit json as dip8", () => {
  const pdipJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const dipJson = fp.string("dip8").circuitJson() as AnyCircuitElement[]
  expect(pdipJson).toEqual(dipJson)
})

test("pdip16", () => {
  const circuitJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip16")
})

test("pdip8 with builder API", () => {
  const circuitJson = fp().pdip(8).w(7.62).circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8_builder")
})
