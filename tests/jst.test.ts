import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst_ph", () => {
  const circuitJson = fp.string("jst_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph")
})

test("jst_sh", () => {
  const circuitJson = fp.string("jst_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh")
})

test("jst8_sh", () => {
  const circuitJson = fp.string("jst8_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst8_sh")
})
test("jst2_sh", () => {
  const circuitJson = fp.string("jst2_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst2_sh")
})

test("jst6_sh", () => {
  const circuitJson = fp.string("jst6_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst6_sh")
})

test("jst_sh6_is_invalid", () => {
  expect(() => fp.string("jst_sh6").json()).toThrow()
})
