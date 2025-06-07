import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("son8", () => {
  const circuitJson = fp.string("son8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8")
})

test("son8_w3.0mm_h3.0mm_p0.65mm", () => {
  const circuitJson = fp.string("son8_w3.0mm_h3.0mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_w3.0mm_h3.0mm_p0.65mm",
  )
})

test("son8_p0.75mm_h3.2mm", () => {
  const circuitJson = fp.string("son8_p0.75mm_h3.2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_p0.75mm_h3.2mm")
})

test("son8_h3.0mm_pl0.7mm", () => {
  const circuitJson = fp.string("son8_h3.0mm_pl0.7mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_h3.0mm_pl0.7mm")
})

test("son8_ep", () => {
  const circuitJson = fp.string("son8_ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_ep")
})

test("son8_ep_w3.0mm_h3.0mm_p0.65mm", () => {
  const circuitJson = fp.string("son8_ep_w3.0mm_h3.0mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_w3.0mm_h3.0mm_p0.65mm",
  )
})

test("son8_ep_p0.75mm_h3.2mm", () => {
  const circuitJson = fp.string("son8_ep_p0.75mm_h3.2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_p0.75mm_h3.2mm",
  )
})

test("son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm", () => {
  const circuitJson = fp
    .string("son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm",
  )
})
test("son6", () => {
  const circuitJson = fp.string("son6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son6")
})
