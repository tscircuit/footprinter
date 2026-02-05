import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule with screen", () => {
  const circuitJson = fp.string("mountedpcbmodule_screen").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "mountedpcbmodule_screen_1",
  )
})
