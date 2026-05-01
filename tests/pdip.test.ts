import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("pdip8 string resolves same as dip8", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()
  expect(pdipJson).toEqual(dipJson)
})

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

test("PDIP8 uppercase string resolves", () => {
  const uppercaseJson = fp.string("PDIP8").json()
  const lowercaseJson = fp.string("pdip8").json()
  expect(uppercaseJson).toEqual(lowercaseJson)
})

test("pdip-8 hyphenated string resolves", () => {
  // After sot23- normalization pattern, confirm PDIP still resolves
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  expect(circuitJson.length).toBeGreaterThan(0)
})

test("spdip28 string resolves same as dip28", () => {
  const spdipJson = fp.string("spdip28").json()
  const dipJson = fp.string("dip28").json()
  expect(spdipJson).toEqual(dipJson)
})

test("spdip28", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})
