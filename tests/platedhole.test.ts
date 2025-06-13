import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

// Ensure platedhole with diameter specification works

test("platedhole_d1.2", () => {
  const soup = fp.string("platedhole_d1.2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "platedhole_d1.2")
})

test("platedhole_r0.6", () => {
  const soup = fp.string("platedhole_r0.6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "platedhole_r0.6")
})

test("platedhole_squarepad", () => {
  const soup = fp.string("platedhole_squarepad").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  const platedholeJson = fp.string("platedhole_squarepad").json() as any
  expect(platedholeJson.squarepad).toBe(true)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "platedhole_squarepad",
  )
})
