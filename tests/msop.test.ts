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

test("msop10_pw0.33mm_p0.5mm", () => {
  const circuitJson = fp
    .string("msop10_pw0.33mm_p0.5mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop10_pw0.33mm_p0.5mm",
  )
})

test("msop12_h4mm_w3mm_pl0.88mm_pw0.4mm", () => {
  const circuitJson = fp
    .string("msop12_h4mm_w3mm_pl0.88mm_pw0.4mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop12_h4mm_w3mm_pl0.88mm_pw0.4mm",
  )
})

test("msop16_h4mm_w3mm_p0.5mm_pl0.88mm_pw0.3mm", () => {
  const circuitJson = fp
    .string("msop16_h4mm_w3mm_p0.5mm_pl0.88mm_pw0.3mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop16_h4mm_w3mm_p0.5mm_pl0.88mm_pw0.3mm",
  )
})
