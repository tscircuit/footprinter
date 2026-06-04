import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("dfn8_w5.3mm_p1.27mm", () => {
  const soup = fp.string("dfn8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dfn8_w5.3mm_p1.27mm")
})

test("UTDFN-4-EP(1x1) footprint normalization & rendering", () => {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const pads = circuitJson.filter((x: any) => x.type === "pcb_pad")
  expect(pads.length).toBe(5) // 4 pins + 1 exposed pad

  // Verify exposed pad (pin 5) is at 0, 0
  const epPad: any = pads.find(
    (x: any) => x.pcb_pad_id === "5" || x.name === "5",
  )
  expect(epPad).toBeDefined()
  expect(epPad.x).toBe(0)
  expect(epPad.y).toBe(0)
})

test("utdfn_4_ep(1x1) alias parity", () => {
  const canonical = fp
    .string(
      "dfn4_w1.00mm_h1.00mm_p0.65mm_pl0.30mm_pw0.25mm_ep_epw0.50mm_eph0.50mm",
    )
    .circuitJson()
  const alias = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  expect(alias).toEqual(canonical)
})
