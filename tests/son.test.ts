import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("son8", () => {
  const circuitJson = fp.string("son8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8")
})

test("son8_w3.0mm_h3.0mm_p0.65mm", () => {
  const circuitJson = fp.string("son8_w3.0mm_h3.0mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_w3.0mm_h3.0mm_p0.65mm",
  )
})

test("son8_p0.75mm_h3.2mm", () => {
  const circuitJson = fp.string("son8_p0.75mm_h3.2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_p0.75mm_h3.2mm")
})

test("son8_h3.0mm_pl0.7mm", () => {
  const circuitJson = fp.string("son8_h3.0mm_pl0.7mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_h3.0mm_pl0.7mm")
})

test("son8_ep", () => {
  const circuitJson = fp.string("son8_ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_ep")
})

test("son8_ep_w3.0mm_h3.0mm_p0.65mm", () => {
  const circuitJson = fp.string("son8_ep_w3.0mm_h3.0mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_w3.0mm_h3.0mm_p0.65mm",
  )
})

test("son8_ep_p0.75mm_h3.2mm", () => {
  const circuitJson = fp.string("son8_ep_p0.75mm_h3.2mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_p0.75mm_h3.2mm",
  )
})

test("son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm", () => {
  const circuitJson = fp
    .string("son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm")
    .circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "son8_ep_h3.0mm_pl0.7mm_epw1.5mm_eph1.7mm",
  )
})
test("son6", () => {
  const circuitJson = fp.string("son6").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son6")
})

test("son8 pins are numbered counterclockwise", () => {
  const circuitJson = fp.string("son8").circuitJson() as any[]
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

test("son6 pins are numbered counterclockwise", () => {
  const circuitJson = fp.string("son6").circuitJson() as any[]
  const pad = (pin: string) =>
    circuitJson.find(
      (el) => el.type === "pcb_smtpad" && el.port_hints?.[0] === pin,
    )
  // Pins 1-3 run down the left side, pins 4-6 run up the right side,
  // so pin 4 sits across from pin 3 and pin 6 across from pin 1
  expect(pad("4").y).toBeCloseTo(pad("3").y)
  expect(pad("6").y).toBeCloseTo(pad("1").y)
  expect(pad("4").y).toBeLessThan(pad("6").y)
})
