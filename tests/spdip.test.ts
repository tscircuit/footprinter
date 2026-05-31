import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("spdip28 string resolves to dip28", () => {
  const spdipJson = fp.string("spdip28").json()
  const dipJson = fp.string("dip28").json()
  expect(spdipJson).toEqual(dipJson)
})

test("SPDIP-28 string resolves to dip28", () => {
  const spdipJson = fp.string("SPDIP-28").json()
  const dipJson = fp.string("dip28").json()
  expect(spdipJson).toEqual(dipJson)
})

test("spdip28_w10mm SVG snapshot", () => {
  const circuitJson = fp.string("spdip28_w10mm").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28_w10mm")
})

