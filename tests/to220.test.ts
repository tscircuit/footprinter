import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { to220 } from "../src/fn/to220"

test("to220_2 (2 holes)", () => {
  const soup = to220({ fn: "to220_2" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_2")
})

test("to220_3 (3 holes)", () => {
  const soup = to220({ fn: "to220_3" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_3")
})
test("to220_4 (4 holes)", () => {
  const soup = to220({ fn: "to220_4" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(soup).toBeDefined()
  expect(soup.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_4")
})
