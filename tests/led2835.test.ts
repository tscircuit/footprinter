import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led2835 default", () => {
  const circuitJson = fp.string("led2835").circuitJson()
  expect(circuitJson).toBeTruthy()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led2835")
})

test("led2835 has courtyard", () => {
  const circuitJson = fp.string("led2835").circuitJson()
  const courtyard = circuitJson.filter((e) => e.type === "pcb_courtyard_rect")
  expect(courtyard.length).toBeGreaterThan(0)
})

test("led2835 has polarity silkscreen", () => {
  const circuitJson = fp.string("led2835").circuitJson()
  const silkscreen = circuitJson.filter((e) => e.type === "pcb_silkscreen_path")
  expect(silkscreen.length).toBeGreaterThan(0)
})

test("led2835 pad count is 2 (anode + cathode)", () => {
  const circuitJson = fp.string("led2835").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
})
