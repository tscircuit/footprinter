import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_holexdist_holeydist_pinrowbottom_pinrowfemale_holes(topleft,bottomleft,bottomright)", () => {
  const soup = fp
    .string(
      "mountedpcbmodule_holexdist_holeydist_pinrowbottom_pinrowfemale_holes(topleft,bottomleft,bottomright)",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
