import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot343", () => {
  const circuitJson = fp.string("sot343").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot343")
})

test("sot343_pl1.2_pw0.9_p2_w5.2_h5", () => {
  const circuitJson = fp.string("sot343_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_pl1.2_pw0.9_p2_w5.2_h5",
  )
})

test("sot343 parameters reproduce C151520", () => {
  const circuitJson = fp
    .string(
      "sot343_p0.4452mm_rowspan2mm_pl0.7mm_pw0.7mm_pin2padlength0.9mm_pin2padcenteroffsetx-0.15mm_rounded0",
    )
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(pads).toMatchObject([
    { port_hints: ["1"], x: -0.854784, y: -1, width: 0.7, height: 0.7 },
    { port_hints: ["2"], x: 0.2952, y: -1, width: 0.9, height: 0.7 },
    { port_hints: ["3"], x: 0.4452, y: 1, width: 0.7, height: 0.7 },
    { port_hints: ["4"], x: -0.854784, y: 1, width: 0.7, height: 0.7 },
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_c151520_parameters",
  )
})
