import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode0402 string produces 2 SMT pads with correct imperial size", () => {
  const soup = fp.string("diode0402").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  // 0402: pw=0.54mm, ph=0.64mm, p=1.02mm
  const pad1 = pads.find((p: any) => p.port_hints?.includes("1"))
  expect(pad1).toBeDefined()
  expect(pad1!.width).toBeCloseTo(0.54, 1)
  expect(pad1!.height).toBeCloseTo(0.64, 1)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0402_string")
})

test("diode0805 string produces 2 SMT pads with correct imperial size", () => {
  const soup = fp.string("diode0805").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  // 0805: pw=1.025mm, ph=1.4mm
  const pad1 = pads.find((p: any) => p.port_hints?.includes("1"))
  expect(pad1!.width).toBeCloseTo(1.025, 2)
  expect(pad1!.height).toBeCloseTo(1.4, 1)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0805_string")
})

test("diode1206 string produces 2 SMT pads", () => {
  const soup = fp.string("diode1206").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode1206_string")
})

test("diode string matches diode builder API output", () => {
  const fromString = fp.string("diode0603").circuitJson()
  const fromBuilder = fp().diode().imperial("0603").circuitJson()

  const stringPads = fromString.filter((e: any) => e.type === "pcb_smtpad")
  const builderPads = fromBuilder.filter((e: any) => e.type === "pcb_smtpad")

  expect(stringPads).toHaveLength(builderPads.length)

  for (let i = 0; i < stringPads.length; i++) {
    expect(stringPads[i].x).toBeCloseTo(builderPads[i].x, 5)
    expect(stringPads[i].y).toBeCloseTo(builderPads[i].y, 5)
    expect(stringPads[i].width).toBeCloseTo(builderPads[i].width, 5)
    expect(stringPads[i].height).toBeCloseTo(builderPads[i].height, 5)
  }
})

test("diode0402_metric string uses metric lookup", () => {
  const params = fp.string("diode1005_metric").params()
  expect(params.metric).toBe("1005")
  expect(params.fn).toBe("diode")
})

test("diode0603_tht string produces through-hole pads", () => {
  const soup = fp.string("diode0603_tht").circuitJson()
  const holes = soup.filter((e: any) => e.type === "pcb_plated_hole")
  expect(holes).toHaveLength(2)
})
