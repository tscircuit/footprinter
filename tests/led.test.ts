import "bun-match-svg"
import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { led } from "src/fn"

test("led_rect", () => {
  const soup = led({
    tht: false,
    p: 2.5,
    pw: 0.5,
    ph: 0.5,
  }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_rect")
})
test("led_hole", () => {
  const soup = led({
    tht: true,
    p: 2,
    pw: 0.5,
    ph: 0.5,
    metric: "mm",
    w: 5,
    h: 2,
  }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led_hole")
})
