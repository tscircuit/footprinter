import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("stampboard", () => {
  const soup = fp
    .string("stampboard_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampboard_left20_right20_bottom3_top2_w21mm_p2.54mm_innerhole",
  )
})
test("stampboard", () => {
  const soup = fp
    .string("stampboard_left10_right10_bottom4_top0_w21mm_p2.54mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "stampboard_left10_right10_bottom4_top0_w21mm_p2.54mm",
  )
})
