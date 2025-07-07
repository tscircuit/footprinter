import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lqfn56_w7_h7_p0.4mm", () => {
  const soup = fp.string("lqfn56_w7_h7_p0.4mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lqfn56_w7_h7_p0.4mm")
})
