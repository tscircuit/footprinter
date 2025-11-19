import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { led } from "../src/fn"
import { fp } from "../src/footprinter"

test("led_rect noref", () => {
  const soup = led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
    noref: true,
  }).circuitJson

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect_noref")
})
