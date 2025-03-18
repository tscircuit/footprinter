import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("vson8ep", () => {
  const circuitJson = fp.string("vson8ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "vson8ep")
})

test("vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm", () => {
  const circuitJson = fp.string("vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm",
  )
})

test("vson8ep_ThermalVias", () => {
  const circuitJson = fp
    .string("vson8ep_ThermalVias")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vson8ep_ThermalVias",
  )
})

test("vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm_ThermalVias", () => {
  const circuitJson = fp
    .string("vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm_ThermalVias")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "vson8ep_w3mm_epw1.6mm_eph2.2mm_p0.5mm_ThermalVias",
  )
})