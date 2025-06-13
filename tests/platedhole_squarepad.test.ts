import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("platedhole_squarepad_d1.2", () => {
  const soup = fp.string("platedhole_squarepad_d1.2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "platedhole_squarepad_d1.2")
})

test("platedhole_squarepad_r0.6", () => {
  const soup = fp.string("platedhole_squarepad_r0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "platedhole_squarepad_r0.6")
})
