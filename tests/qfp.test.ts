import "bun-match-svg"
import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfp48_w14_p1mm", () => {
  const soup = fp.string("qfp48_w14_p1mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfp48_w14_p1mm")
})

test("qfp48_w14_p1mm_startingpin(topside,leftpin)", () => {
  const soup = fp
    .string("qfp48_w14_p1mm_startingpin(topside,leftpin)")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfp48_w14_p1mm_startingpin(topside,leftpin)",
  )
})

test("qfp80_w14_h14_p0.65mm", () => {
  const soup = fp
    .string("qfp80_w14_h14_p0.65mm_startingpin(topside,leftpin)")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfp80_w14_h14_p0.65mm_startingpin(topside,leftpin)",
  )
})
