import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("msop8", () => {
  const circuitJson = fp.string("msop8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8")
})

test("msop8_w3.10mm_h3.32mm_p0.65mm", () => {
  const circuitJson = fp.string("msop8_w3.10mm_h3.32mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop8_w3.10mm_h3.32mm_p0.65mm",
  )
})

test("msop8_p0.75mm", () => {
  const circuitJson = fp.string("msop8_p0.75mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8_p0.75mm")
})

test("msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm", () => {
  const circuitJson = fp
    .string("msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm",
  )
})

test("msop10", () => {
  const circuitJson = fp.string("msop10").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop10")
})

test("msop12", () => {
  const circuitJson = fp.string("msop12").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop12")
})

test("msop16", () => {
  const circuitJson = fp.string("msop16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop16")
})
