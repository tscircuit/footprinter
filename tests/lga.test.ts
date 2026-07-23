import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((element): element is PcbSmtPad => element.type === "pcb_smtpad")

test("lga14 supports four and three pads on alternating sides", () => {
  const footprint = "lga14_grid4x3_p0.5mm_w3.2mm_h2.7mm_pw0.28mm_pl0.675mm"
  const circuitJson = fp.string(footprint).circuitJson()
  const pads = circuitJson.filter(
    (element): element is PcbSmtPad => element.type === "pcb_smtpad",
  )

  expect(pads).toHaveLength(14)
  expect(pads.filter((pad) => Math.abs(pad.x) > 1)).toHaveLength(8)
  expect(pads.filter((pad) => Math.abs(pad.y) > 1)).toHaveLength(6)
  expect(pads[0]?.x).toBeCloseTo(-1.2625)
  expect(pads[0]?.y).toBeCloseTo(0.75)
  expect(pads[4]?.x).toBeCloseTo(-0.5)
  expect(pads[4]?.y).toBeCloseTo(-1.0125)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    footprint,
  )
})

test("lga16 supports pill pads and a five by three side grid", () => {
  const footprint =
    "lga16_grid5x3_p0.5mm_w3.6mm_h3.6mm_pw0.28mm_pl0.8mm_pillpads"
  const circuitJson = fp.string(footprint).circuitJson()
  const pads = getPads(footprint)

  expect(pads).toHaveLength(16)
  expect(pads.every((pad) => pad.shape === "pill")).toBe(true)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    footprint,
  )
})

test("lga6 supports pads on only two opposing sides", () => {
  const footprint = "lga6_grid3x0_p0.94mm_w1.74mm_pw0.64mm_pl0.57mm"
  const circuitJson = fp.string(footprint).circuitJson()
  const pads = getPads(footprint)

  expect(pads).toHaveLength(6)
  expect(pads.every((pad) => Math.abs(pad.x) > 0.5)).toBe(true)
  expect(pads.map((pad) => pad.y)).toEqual([0.94, 0, -0.94, -0.94, 0, 0.94])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    footprint,
  )
})

test("lga rejects a side grid that does not match its pad count", () => {
  expect(() => fp.string("lga14_grid4x4").circuitJson()).toThrow(
    "requires 16 pads, got 14",
  )
})
