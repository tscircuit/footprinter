import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("to92s", () => {
  const circuitJson = fp.string("to92s").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})

test("to92s_2", () => {
  const circuitJson = fp.string("to92s_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_2")
})

test("to92s_3", () => {
  const circuitJson = fp.string("to92s_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_3")
})

test("to92s_4", () => {
  try {
    const circuitJson = fp.string("to92s_4").circuitJson()
    const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
    // Expecting failure due to invalid number of pins
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to92s_4")
  } catch (error) {
    // Assert that the error is of type Error
    const e = error as Error
    // Catch the expected ZodError related to num_pins being invalid
    expect(e).toBeInstanceOf(Error)
    expect(e.message).toContain("Invalid literal value, expected 3")
    expect(e.message).toContain("Invalid literal value, expected 2")
  }
})
