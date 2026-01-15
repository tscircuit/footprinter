import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_pinrow10_holexdist_holeydist_pinrowleft_pinrowholeedgetoedgedist1mm_width10mm", () => {
  const soup = fp
    .string(
      "mountedpcbmodule_pinrow10_holexdist_holeydist_pinrowleft_pinrowholeedgetoedgedist1mm_width10mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path
  )
})
