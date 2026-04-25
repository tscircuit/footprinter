import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led5050 default", () => {
  const circuitJson = fp.string("led5050").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(6)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led5050")
})

test("led5050 has courtyard", () => {
  const circuitJson = fp.string("led5050").circuitJson()
  const courtyard = circuitJson.filter((e) => e.type === "pcb_courtyard_rect")
  expect(courtyard.length).toBeGreaterThan(0)
})

test("led5050 has silkscreen", () => {
  const circuitJson = fp.string("led5050").circuitJson()
  const silkscreen = circuitJson.filter(
    (e) => e.type === "pcb_silkscreen_path" || e.type === "pcb_silkscreen_text",
  )
  expect(silkscreen.length).toBeGreaterThan(0)
})
