import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("breakoutheaders noref", () => {
  const soup = fp
    .string("breakoutheaders_left15_right15_w8mm_p1.54mm_noref")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "breakoutheaders_left20_right20_w8mm_p2.54mm_noref",
  )
})
