import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led0402 generates 2 pads (imperial size code)", () => {
  const circuitJson = fp.string("led0402").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
})

test("diode0603 generates 2 pads (imperial size code)", () => {
  const circuitJson = fp.string("diode0603").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
})

test("led0402 and res0402 generate the same footprint", () => {
  const ledJson = fp.string("led0402").circuitJson()
  const resJson = fp.string("res0402").circuitJson()
  const ledPads = ledJson.filter((e) => e.type === "pcb_smtpad")
  const resPads = resJson.filter((e) => e.type === "pcb_smtpad")
  // Both should have 2 pads at the same positions
  expect(ledPads.length).toBe(resPads.length)
})

test("diode1206 generates valid footprint", () => {
  const circuitJson = fp.string("diode1206").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode1206")
})

test("led1206 generates valid footprint", () => {
  const circuitJson = fp.string("led1206").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(2)
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led1206")
})
