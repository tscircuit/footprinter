import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("spdip28", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  expect(circuitJson.length).toBeGreaterThan(0)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})

test("spdip16", () => {
  const circuitJson = fp.string("spdip16").circuitJson() as AnyCircuitElement[]
  expect(circuitJson.length).toBeGreaterThan(0)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip16")
})
