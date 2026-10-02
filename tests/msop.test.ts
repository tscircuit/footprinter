import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("msop8", () => {
  const circuitJson = fp.string("msop8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8")
})

test("msop8_w3.10mm_h3.32mm_p0.65mm", () => {
  const circuitJson = fp.string("msop8_w3.10mm_h3.32mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop8_w3.10mm_h3.32mm_p0.65mm",
  )
})

test("msop8_p0.75mm", () => {
  const circuitJson = fp.string("msop8_p0.75mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8_p0.75mm")
})

test("msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm", () => {
  const circuitJson = fp
    .string("msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "msop8_h3.32mm_pl1.63mm_pw0.4mm_p0.8mm",
  )
})

test("msop10", () => {
  const circuitJson = fp.string("msop10").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop10")
})

test("msop12", () => {
  const circuitJson = fp.string("msop12").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop12")
})

test("msop16", () => {
  const circuitJson = fp.string("msop16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop16")
})

test("msop8 pins are numbered counterclockwise", () => {
  const circuitJson = fp.string("msop8").circuitJson() as any[]
  const pad = (pin: string) =>
    circuitJson.find(
      (el) => el.type === "pcb_smtpad" && el.port_hints?.[0] === pin,
    )
  // Pins 1-4 run down the left side, pins 5-8 run up the right side,
  // so pin 5 sits across from pin 4 and pin 8 across from pin 1
  expect(pad("5").y).toBeCloseTo(pad("4").y)
  expect(pad("8").y).toBeCloseTo(pad("1").y)
  expect(pad("5").y).toBeLessThan(pad("8").y)
})
