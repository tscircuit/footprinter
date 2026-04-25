import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lpcc32 default", () => {
  const circuitJson = fp.string("lpcc32").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  // 32 signal pads + 1 thermal pad
  expect(pads.length).toBe(33)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lpcc32")
})

test("lpcc16", () => {
  const circuitJson = fp.string("lpcc16").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  // 16 signal pads + 1 thermal pad
  expect(pads.length).toBe(17)
})

test("lpcc has courtyard", () => {
  const circuitJson = fp.string("lpcc32").circuitJson()
  const courtyard = circuitJson.filter(
    (e) =>
      e.type === "pcb_courtyard_rect" || e.type === "pcb_courtyard_outline",
  )
  expect(courtyard.length).toBeGreaterThan(0)
})
