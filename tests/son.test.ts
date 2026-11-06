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

test("son counter-clockwise pin numbering (#677)", () => {
  const son8Json = fp.string("son8").circuitJson()
  const son8Pads = son8Json.filter((e) => e.type === "pcb_smtpad") as any[]
  const getPad = (pads: any[], pin: string) =>
    pads.find((p) => p.port_hints?.includes(pin))

  expect(getPad(son8Pads, "1").x).toBeLessThan(0)
  expect(getPad(son8Pads, "1").y).toBeCloseTo(0.75, 5)
  expect(getPad(son8Pads, "4").x).toBeLessThan(0)
  expect(getPad(son8Pads, "4").y).toBeCloseTo(-0.75, 5)
  expect(getPad(son8Pads, "5").x).toBeGreaterThan(0)
  expect(getPad(son8Pads, "5").y).toBeCloseTo(-0.75, 5)
  expect(getPad(son8Pads, "6").y).toBeCloseTo(-0.25, 5)
  expect(getPad(son8Pads, "7").y).toBeCloseTo(0.25, 5)
  expect(getPad(son8Pads, "8").x).toBeGreaterThan(0)
  expect(getPad(son8Pads, "8").y).toBeCloseTo(0.75, 5)

  const son6Pads = fp
    .string("son6")
    .circuitJson()
    .filter((e) => e.type === "pcb_smtpad") as any[]
  expect(getPad(son6Pads, "1").y).toBeGreaterThan(getPad(son6Pads, "3").y)
  expect(getPad(son6Pads, "6").y).toBeGreaterThan(getPad(son6Pads, "4").y)
  expect(getPad(son6Pads, "4").y).toBeCloseTo(getPad(son6Pads, "3").y, 5)
  expect(getPad(son6Pads, "6").y).toBeCloseTo(getPad(son6Pads, "1").y, 5)

  const annotatedJson = [
    ...son8Json,
    ...son8Pads.map((pad: any) => ({
      type: "pcb_silkscreen_text" as const,
      pcb_silkscreen_text_id: `pin_${pad.port_hints[0]}`,
      pcb_component_id: "",
      layer: "top" as const,
      text: String(pad.port_hints[0]),
      font: "tscircuit2024" as const,
      font_size: 0.35,
      anchor_position: {
        x: pad.x < 0 ? pad.x - 0.65 : pad.x + 0.65,
        y: pad.y,
      },
      anchor_alignment: "center" as const,
    })),
  ]
  const svgContent = convertCircuitJsonToPcbSvg(annotatedJson as any)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "son8_ccw_pins")
})
