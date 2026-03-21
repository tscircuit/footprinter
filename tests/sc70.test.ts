import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sc70", () => {
  const circuitJson = fp.string("sc70").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sc70")
})

test("sc70_3", () => {
  const circuitJson = fp.string("sc70_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sc70_3")
})

test("sc70 custom params", () => {
  const circuitJson = fp
    .string("sc70_w2.0mm_h1.25mm_p0.65mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sc70_custom")
})
