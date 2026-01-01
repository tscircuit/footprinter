import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("plcc44_w16.5_h16.5_p1.27mm", () => {
  const soup = fp.string("plcc44_w16.5_h16.5_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "plcc44_w16.5_h16.5_p1.27mm")
})
