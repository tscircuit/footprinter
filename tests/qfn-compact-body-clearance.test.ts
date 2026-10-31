import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { fp } from "../src/footprinter"

const getMinRectPadGap = (footprint: string) => {
  const pads = fp
    .string(footprint)
    .circuitJson()
    .filter(
      (element): element is Extract<PcbSmtPad, { shape: "rect" }> =>
        element.type === "pcb_smtpad" && element.shape === "rect",
    )

  let minGap = Number.POSITIVE_INFINITY
  for (let i = 0; i < pads.length; i++) {
    const a = pads[i]!
    for (let j = i + 1; j < pads.length; j++) {
      const b = pads[j]!
      const dx = Math.abs(a.x - b.x) - (a.width + b.width) / 2
      const dy = Math.abs(a.y - b.y) - (a.height + b.height) / 2
      const gap = Math.max(dx, dy)
      if (gap < minGap) {
        minGap = gap
      }
    }
  }
  return minGap
}

test("single-row QFN with explicit compact w/h shortens default pl so corner pads do not overlap", () => {
  for (const footprint of [
    "qfn32_w5_h5_p0.5mm",
    "qfn16_w3_h3_p0.5mm",
    "qfn24_w6_h6_p0.8mm",
    "qfn32",
    "qfn16",
  ]) {
    expect(getMinRectPadGap(footprint)).toBeCloseTo(0.15, 6)
  }
})

test("explicit pl on single-row QFN is preserved unchanged", () => {
  const pads = fp
    .string("qfn16_w3_h3_p0.5mm_pl0.875mm")
    .circuitJson()
    .filter(
      (element): element is Extract<PcbSmtPad, { shape: "rect" }> =>
        element.type === "pcb_smtpad" && element.shape === "rect",
    )

  expect(Math.max(pads[0]!.width, pads[0]!.height)).toBeCloseTo(0.875, 6)
})
