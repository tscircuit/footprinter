import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot25", () => {
  const circuitJson = fp.string("sot25").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot25")
})

test("C156283 SOT-25 uses its measured pad-row span", () => {
  const circuitJson = fp
    .string(
      "sot25_w2.794mm_p0.9525mm_pw0.6223mm_pl1.1049mm_rounded0_pin1location(rightside,bottom)",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element) =>
      element.type === "pcb_smtpad" && element.shape === "rotated_rect",
  )

  expect(pads).toHaveLength(5)
  expect(pads.every((pad) => pad.corner_radius === 0)).toBe(true)
  expect(pads.every((pad) => Math.abs(pad.x) === 1.397)).toBe(true)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "C156283_sot25")
})
