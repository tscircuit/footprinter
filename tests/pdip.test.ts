import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip14", () => {
  const circuitJson = fp.string("pdip14").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip14")
})

test("pdip16", () => {
  const circuitJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip16")
})

test("pdip8 parameters", () => {
  const json = fp.string("pdip8").json()
  expect(json.num_pins).toBe(8)
  expect(json.p).toBe(2.54)
  expect(json.w).toBe(7.62)
})

// SPDIP tests
test("spdip28", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})

test("spdip28 parameters", () => {
  const json = fp.string("spdip28").json()
  expect(json.num_pins).toBe(28)
  // 70mil pitch
  expect(json.p).toBeCloseTo(1.778, 2)
  // 600mil row spacing
  expect(json.w).toBeCloseTo(15.24, 1)
})
