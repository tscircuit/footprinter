import "bun-match-svg"
import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "dist"

test("soic8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("soic8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_w5.3mm_p1.27mm",
  )
})
