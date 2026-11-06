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

test("msop counter-clockwise pin numbering (#677)", () => {
  const msop8Json = fp.string("msop8").circuitJson() as AnyCircuitElement[]
  const msop8Pads = msop8Json.filter((e) => e.type === "pcb_smtpad") as any[]
  const getPad = (pads: any[], pin: string) =>
    pads.find((p) => p.port_hints?.includes(pin))

  expect(getPad(msop8Pads, "1").x).toBeLessThan(0)
  expect(getPad(msop8Pads, "1").y).toBeCloseTo(0.975, 5)
  expect(getPad(msop8Pads, "4").x).toBeLessThan(0)
  expect(getPad(msop8Pads, "4").y).toBeCloseTo(-0.975, 5)
  expect(getPad(msop8Pads, "5").x).toBeGreaterThan(0)
  expect(getPad(msop8Pads, "5").y).toBeCloseTo(-0.975, 5)
  expect(getPad(msop8Pads, "6").y).toBeCloseTo(-0.325, 5)
  expect(getPad(msop8Pads, "7").y).toBeCloseTo(0.325, 5)
  expect(getPad(msop8Pads, "8").x).toBeGreaterThan(0)
  expect(getPad(msop8Pads, "8").y).toBeCloseTo(0.975, 5)

  const msop10Pads = fp
    .string("msop10")
    .circuitJson()
    .filter((e) => e.type === "pcb_smtpad") as any[]
  expect(getPad(msop10Pads, "1").y).toBeGreaterThan(getPad(msop10Pads, "5").y)
  expect(getPad(msop10Pads, "10").y).toBeGreaterThan(getPad(msop10Pads, "6").y)
  expect(getPad(msop10Pads, "6").y).toBeCloseTo(getPad(msop10Pads, "5").y, 5)
  expect(getPad(msop10Pads, "10").y).toBeCloseTo(getPad(msop10Pads, "1").y, 5)

  const annotatedJson: AnyCircuitElement[] = [
    ...msop8Json,
    ...msop8Pads.map((pad: any) => ({
      type: "pcb_silkscreen_text" as const,
      pcb_silkscreen_text_id: `pin_${pad.port_hints[0]}`,
      pcb_component_id: "",
      layer: "top" as const,
      text: String(pad.port_hints[0]),
      font: "tscircuit2024" as const,
      font_size: 0.35,
      anchor_position: {
        x: pad.x < 0 ? pad.x - 1.15 : pad.x + 1.15,
        y: pad.y,
      },
      anchor_alignment: "center" as const,
    })),
  ]
  const svgContent = convertCircuitJsonToPcbSvg(annotatedJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "msop8_ccw_pins")
})
