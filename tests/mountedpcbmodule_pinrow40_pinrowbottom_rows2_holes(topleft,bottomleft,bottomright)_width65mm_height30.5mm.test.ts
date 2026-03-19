import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_pinrow40_pinrowbottom_rows2_holes(topleft,bottomleft,bottomright)_width65mm_height30.5mm", () => {
  const circuitJson = fp
    .string(
      "mountedpcbmodule_pinrow40_pinrowbottom_rows2_holes(topleft,bottomleft,bottomright)_width65mm_height30.5mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
