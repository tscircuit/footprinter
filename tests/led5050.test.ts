import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led5050 (default 6 pins)", () => {
  const circuitJson = fp.string("led5050").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050")
})

test("led5050 (4 pins WS2812B variant)", () => {
  const circuitJson = fp.string("led5050_4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050_4")
})
