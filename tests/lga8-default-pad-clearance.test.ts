import { expect, test } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

type RectPad = Extract<PcbSmtPad, { shape: "rect" | "pill" }>

const getPadGap = (left: RectPad, right: RectPad) => {
  const dx = Math.max(
    0,
    Math.abs(left.x - right.x) - (left.width + right.width) / 2,
  )
  const dy = Math.max(
    0,
    Math.abs(left.y - right.y) - (left.height + right.height) / 2,
  )
  return Math.hypot(dx, dy)
}

const getMinimumPadGap = (pads: RectPad[]) => {
  let minimum = Number.POSITIVE_INFINITY
  for (let first = 0; first < pads.length; first += 1) {
    for (let second = first + 1; second < pads.length; second += 1) {
      minimum = Math.min(minimum, getPadGap(pads[first]!, pads[second]!))
    }
  }
  return minimum
}

test("lga8 default pads leave 0.085mm between the side and end pads", () => {
  const footprint = "lga8_w2_h2.5_p0.65mm"
  const circuitJson = fp.string(footprint).circuitJson()
  const pads = circuitJson.filter(
    (element): element is RectPad =>
      element.type === "pcb_smtpad" &&
      (element.shape === "rect" || element.shape === "pill"),
  )

  expect(pads).toHaveLength(8)
  expect(getMinimumPadGap(pads)).toBeCloseTo(0.085, 3)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    footprint,
  )
})
