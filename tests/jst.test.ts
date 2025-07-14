import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst", () => {
  const circuitJson = fp.string("jst_ph").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_ph")
})

test("jst", () => {
  const circuitJson = fp.string("jst_sh").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh")
})

test("jst_sh6", () => {
  const circuitJson = fp.string("jst_sh6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst_sh6")
})


