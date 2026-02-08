import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("mountedpcbmodule with custom screen size and offset", () => {
  const circuitJson = fp
    .string(
      "mountedpcbmodule_width20_height20_screen_screenwidth18mm_screenheight10mm_screencenteroffsety4mm",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "mountedpcbmodule_screen_custom_1",
  )
})
