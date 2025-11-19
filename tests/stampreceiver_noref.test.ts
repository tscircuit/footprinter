import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("stampreceiver noref", () => {
  const soup = fp
    .string("stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm_noref")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampreceiver_left20_right20_bottom3_top2_w21mm_p2.54mm_noref",
  )
})
