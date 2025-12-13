import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("radial (default)", () => {
  const circuitJson = fp.string("radial").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})

test("radial with custom dimensions", () => {
  const circuitJson = fp
    .string("radial_body_diameter6mm_lead_spacing3mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "custom_dimensions")
})

test("radial with 3D model hint", () => {
  const circuitJson = fp
    .string("radial_model_hintCapacitor_Radial_6.3x5.4")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "with_3d_model")
})
