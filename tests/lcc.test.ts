import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("lcc68", () => {
  const soup = fp.string("lcc68_w24.2_h24.2_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  const pads = soup.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(68)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "lcc68")
})

test("lcc44 defaults to 1.27mm pitch without overlapping pads (fixes #794)", () => {
  const soup = fp.string("lcc44").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad") as any[]
  expect(pads).toHaveLength(44)

  // Verify pitch along Y axis between pad 1 and pad 2
  const p1 = pads[0]
  const p2 = pads[1]
  const pitchY = Math.abs(p1.y - p2.y)
  expect(pitchY).toBeCloseTo(1.27, 2)

  // Verify clearance gap between adjacent pads is strictly positive
  const gap = pitchY - p1.height
  expect(gap).toBeGreaterThan(0.5)
})

test("lcc preserves explicit custom pitch", () => {
  const soup = fp.string("lcc20_p0.8mm_pw0.4mm").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad") as any[]
  expect(pads).toHaveLength(20)

  const p1 = pads[0]
  const p2 = pads[1]
  const pitchY = Math.abs(p1.y - p2.y)
  expect(pitchY).toBeCloseTo(0.8, 2)
})
