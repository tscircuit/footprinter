import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getMinPadGap = (pads: PcbSmtPad[]) => {
  let minGap = Number.POSITIVE_INFINITY
  for (let i = 0; i < pads.length; i++) {
    for (let j = i + 1; j < pads.length; j++) {
      const a = pads[i] as Extract<PcbSmtPad, { shape: "rect" }>
      const b = pads[j] as Extract<PcbSmtPad, { shape: "rect" }>
      const gapX = Math.abs(a.x - b.x) - (a.width + b.width) / 2
      const gapY = Math.abs(a.y - b.y) - (a.height + b.height) / 2
      minGap = Math.min(minGap, Math.max(gapX, gapY))
    }
  }
  return minGap
}

const getPads = (footprint: string) =>
  fp
    .string(footprint)
    .circuitJson()
    .filter((element): element is PcbSmtPad => element.type === "pcb_smtpad")

test("qfn default pad length keeps corner pads apart on compact bodies", () => {
  for (const footprint of [
    "qfn32_w5_h5_p0.5mm",
    "qfn16_w3_h3_p0.5mm",
    "qfn24_w6_h6_p0.8mm",
    "qfn16_w3_h3_p0.5mm_thermalpad",
  ]) {
    expect(getMinPadGap(getPads(footprint))).toBeCloseTo(0.1, 6)
  }

  // Bodies that already fit the default pad length are unchanged.
  expect(getPads("qfn32")[0]).toMatchObject({ width: 0.875, height: 0.25 })

  // Explicit pad lengths are respected.
  expect(getPads("qfn32_w5_h5_p0.5mm_pl0.6mm")[0]).toMatchObject({
    width: 0.6,
  })

  const svgContent = convertCircuitJsonToPcbSvg(
    fp.string("qfn32_w5_h5_p0.5mm").circuitJson(),
  )
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "qfn32_w5_h5_p0.5mm")
})
