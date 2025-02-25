import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("vson8ep", () => {
  const circuitJson = fp.string("vson8ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vson8ep")
})

test("vson8ep_w3mm_h3mm_p0.65mm", () => {
  const circuitJson = fp
    .string("vson8ep_w3mm_h3mm_p0.65mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vson8ep_w3mm_h3mm_p0.65mm",
  )
})

test("vson8ep_3x3mm_P0.65mm_EP1.65x2.4mm_ThermalVias", () => {
  const circuitJson = fp.string("vson8ep_3x3mm_P0.65mm_EP1.65x2.4mm_ThermalVias").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vson8ep_3x3mm_P0.65mm_EP1.65x2.4mm_ThermalVias")
})
