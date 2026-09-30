import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("bare vson8 renders instead of throwing a parse error", () => {
  const circuitJson = fp.string("vson8").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as Array<{
    x: number
    y: number
    width: number
    height: number
  }>

  expect(pads).toHaveLength(8)

  const leftPads = pads.filter((p) => p.x < 0)
  const rightPads = pads.filter((p) => p.x > 0)
  expect(leftPads).toHaveLength(4)
  expect(rightPads).toHaveLength(4)

  // 0.5mm pitch rows on each side
  const leftYs = leftPads.map((p) => p.y).sort((a, b) => a - b)
  expect(leftYs[1]! - leftYs[0]!).toBeCloseTo(0.5)
  // 2.75mm row separation (pads tucked under the 3mm body edges)
  expect(rightPads[0]!.x - leftPads[0]!.x).toBeCloseTo(2.75)
  // 0.25mm x 0.6mm pin pads
  expect(pads[0]!.width).toBeCloseTo(0.25)
  expect(pads[0]!.height).toBeCloseTo(0.6)
})

test("bare vson renders 8 pins by default", () => {
  const circuitJson = fp.string("vson").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(8)
})

test("vson explicit dimensions still win over defaults", () => {
  const circuitJson = fp
    .string("vson8_p0.4mm_w3.75mm_grid3.9x4mm_pinw0.2mm_pinh0.5mm")
    .circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as Array<{
    x: number
    y: number
    width: number
    height: number
  }>

  expect(pads).toHaveLength(8)
  expect(pads[0]!.width).toBeCloseTo(0.2)
  expect(pads[0]!.height).toBeCloseTo(0.5)
  expect(pads[0]!.x).toBeCloseTo(-1.875)
})
