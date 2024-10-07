import "bun-match-svg"
import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "dist"

test("cap footprint", () => {
  const soup = fp().cap().imperial("0402").soup()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap footprint")
})

test("cap_imperial0402", () => {
  const soup = fp.string("cap_imperial0402").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "cap_imperial0402")
})
