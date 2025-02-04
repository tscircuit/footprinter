import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { to92 } from "../src/fn/to92"

test("to92 (triangular)", () => {
  const soup = to92({ fn: "to92", arrangement: "triangular" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92_triangular")
})

test("to92_inline (inline)", () => {
  const soup = to92({ fn: "to92_inline", arrangement: "inline" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92_inline")
})
