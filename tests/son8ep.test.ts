import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("son8ep", () => {
  const circuitJson = fp.string("son8ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8ep")
})

test("son8ep_w3.0mm_h3.0mm_p0.65mm", () => {
  const circuitJson = fp.string("son8ep_w3.0mm_h3.0mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8ep_w3.0mm_h3.0mm_p0.65mm",
  )
})

test("son8ep_p0.75mm_h3.2mm", () => {
  const circuitJson = fp.string("son8ep_p0.75mm_h3.2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8ep_p0.75mm_h3.2mm",
  )
})

test("son8ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm", () => {
  const circuitJson = fp
    .string("son8ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm",
  )
})
