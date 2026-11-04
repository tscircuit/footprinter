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

test("bare lcc44 defaults to 1.27mm pitch without pad overlap", () => {
  const soup = fp.string("lcc44").circuitJson()
  const pads = soup.filter((element) => element.type === "pcb_smtpad") as any[]
  expect(pads).toHaveLength(44)

  // Distance between neighboring pads (pin 1 and pin 2 along Y) should be 1.27mm pitch
  const pitch = Math.abs(pads[0].y - pads[1].y)
  expect(pitch).toBeCloseTo(1.27, 3)

  // Gap between 0.6mm pads along 1.27mm pitch is 0.67mm > 0 (no overlap)
  const gap = pitch - pads[0].height
  expect(gap).toBeGreaterThan(0.6)
})
