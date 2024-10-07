import "bun-match-svg"
import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "dist"

test("axial_p0.2in", () => {
  const soup = fp.string("axial_p0.2in").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "axial_p0.2in")
})
