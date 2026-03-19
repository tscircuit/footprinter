import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_pinrowleftpins3_pinrowrightpins4_width10", () => {
  const soup = fp
    .string("mountedpcbmodule_pinrowleftpins3_pinrowrightpins4_width10")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
