import { expect, test } from "bun:test"
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
test("qfp52", () => {
  const soup = fp.string("qfp52").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfp52")
})

test("qfp52_w14mm uses 1mm pitch and 0.45mm pad width", () => {
  const params = fp.string("qfp52_w14mm").json() as unknown as {
    p: number
    pw: number
  }
  expect(params.p).toBe(1)
  expect(params.pw).toBe(0.45)
})
