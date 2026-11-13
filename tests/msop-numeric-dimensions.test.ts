import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src"

test.each([
  ["w", 3.5],
  ["h", 4],
  ["p", 0.8],
  ["pl", 1.5],
  ["pw", 0.5],
] as const)("MSOP accepts numeric %s in millimeters", (dimension, value) => {
  const elements = fp().msop(8)[dimension](value).circuitJson()
  const stringElements = fp().msop(8)[dimension](`${value}mm`).circuitJson()
  expect(elements).toEqual(stringElements)
  expect(elements).toEqual(
    fp.string(`msop8_${dimension}${value}mm`).circuitJson(),
  )
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, `msop8_numeric_${dimension}`)
})

test("MSOP converts non-millimeter dimensions consistently", () => {
  const elements = fp().msop(8).w(3.5).h(4).p(0.8).pl(1.5).pw(0.5).circuitJson()
  expect(elements).toEqual(
    fp.string("msop8_w0.35cm_h0.4cm_p0.08cm_pl0.15cm_pw0.05cm").circuitJson(),
  )
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "msop8_numeric_all_dimensions")
})
