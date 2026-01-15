import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule_pinrow8_rows2_pinrowtop", () => {
  const circuitJson = fp
    .string("mountedpcbmodule_pinrow8_rows2_pinrowtop")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
