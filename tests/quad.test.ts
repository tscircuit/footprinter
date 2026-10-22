import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("quad16_w4_l4_p0.4_pw0.25_pl0.4", () => {
  const soup = fp.string("quad16_w4_l4_p0.4_pw0.25_pl0.4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad16_w4_l4_p0.4_pw0.25_pl0.4",
  )
})

test("quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)", () => {
  const soup = fp
    .string(
      "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)",
    )
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "quad16_w4_l4_p0.4_pw0.25_pl0.4_thermalpad_startingpin(bottomside,leftpin)",
  )
})

test("quad throws clear error on zero pitch instead of emitting NaN", () => {
  expect(() => fp.string("lcc_p0mm").circuitJson()).toThrow("Invalid pitch")
  expect(() => fp.string("qfn16_p0mm").circuitJson()).toThrow("Invalid pitch")
})
