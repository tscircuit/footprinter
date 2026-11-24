import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { getQuadSidePinCounts } from "../src/helpers/get-quad-side-pin-counts"

test("quad10 without explicit side pin counts throws", () => {
  expect(() => getQuadSidePinCounts({ num_pins: 10 })).toThrow(
    "Quad num_pins (10) is not divisible by 4; specify leftpins, toppins, rightpins and bottompins explicitly",
  )
  expect(() =>
    fp.string("quad10_w4_l4_p0.5_pw0.25_pl0.4").circuitJson(),
  ).toThrow("not divisible by 4")
})

test("quad10 with explicit side pin counts still generates", () => {
  const soup = fp
    .string(
      "quad10_leftpins3_toppins2_rightpins3_bottompins2_w4_l4_p0.5_pw0.25_pl0.4",
    )
    .circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(10)
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad10_leftpins3_toppins2_rightpins3_bottompins2",
  )
})

test("quad32 without explicit side pin counts still generates", () => {
  const soup = fp.string("quad32_w7_l7_p0.5_pw0.25_pl0.4").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(32)
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad32_w7_l7_p0.5_pw0.25_pl0.4",
  )
})
