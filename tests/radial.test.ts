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
    .string("radial_w6mm_p3mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "custom_dimensions")
})

test("radial with 3D model snapshot", () => {
  const fpRadial = fp.string("radial")
  const circuitJson = fpRadial.circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "with_3d_model")

  const json = fpRadial.json() as any
  expect(json.model_3d).toBeDefined()
})

test("radial has 3D model parameters", () => {
  const json = fp.string("radial").json() as any
  expect(json.model_3d).toBeDefined()
  expect(json.model_3d.bodyShape).toBe("cylinder")
})
