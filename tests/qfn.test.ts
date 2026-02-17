import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("qfn32", () => {
  const soup = fp.string("qfn32").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn32")
})

test("qfn32_w5_h5", () => {
  const soup = fp.string("qfn32_w5_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn32_w5_h5")
})

test("qfn32_w5_h5_p0.5_thermalpad", () => {
  const soup = fp.string("qfn32_w5_h5_p0.5_thermalpad").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "qfn32_w5_h5_p0.5_thermalpad",
  )
})

test("qfn32 generates correct number of pads", () => {
  const soup = fp.string("qfn32").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(32)
})

test("qfn32 with thermalpad generates 33 pads", () => {
  const soup = fp.string("qfn32_thermalpad").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(33)
})

test("qfn32 pad width scales with pitch", () => {
  const soup = fp.string("qfn32_p0.4").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  // With pitch 0.4, pw should be 0.4 * 0.5 = 0.2
  const firstPad = pads[0] as any
  const padWidth = Math.min(firstPad.width, firstPad.height)
  expect(padWidth).toBeCloseTo(0.2, 2)
})
