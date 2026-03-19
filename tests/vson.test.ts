import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm", () => {
  const circuitJson = fp
    .string(
      "VSON8-1EP_grid3x3mm_P0.65mm_EP1.65x2.4mm_w2.9mm_pinw0.85mm_pinh0.35mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8-1EP_3x3mm_P0.65mm_EP1.65x2.4mm",
  )
})

test("VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm", () => {
  const circuitJson = fp
    .string(
      "VSON10-1EP_grid3x3mm_P0.5mm_EP1.2x2mm_w2.875mm_pinw0.875mm_pinh0.25mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-10-1EP_3x3mm_P0.5mm_EP1.2x2mm",
  )
})

test("VSON8_grid1.5x2mm_P0.5mm_w1.075mm_pinw0.575mm_pinh0.35mm", () => {
  const circuitJson = fp
    .string("VSON8_grid1.5x2mm_P0.5mm_w1.075mm_pinw0.575mm_pinh0.35mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_1.5x2mm_P0.5mm",
  )
})

test("VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm", () => {
  const circuitJson = fp
    .string(
      "VSON8-1EP_grid5x6_P1.27mm_ep4.35x4.51mm_epx0.33mm_w5.6mm_pinw0.7mm_pinh0.7mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSONP-8-1EP_5x6_P1.27mm",
  )
})

test("VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm", () => {
  const circuitJson = fp
    .string(
      "VSON8_grid3.3x3.3mm_P0.65mm_ep1.9x2.45mm_epx0.385mm_w2.88mm_pinw0.63mm_pinh0.5mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "VSON-8_3.3x3.3mm_P0.65mm_NexFET",
  )
})
