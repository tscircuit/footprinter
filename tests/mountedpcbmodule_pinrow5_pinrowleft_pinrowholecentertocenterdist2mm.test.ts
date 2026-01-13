import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_pinrow5_pinrowleft_pinrowholecentertocenterdist2mm", () => {
  const circuitJson = fp
    .string(
      "mountedpcbmodule_pinrow5_pinrowleft_pinrowholecentertocenterdist2mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path
  )
})
