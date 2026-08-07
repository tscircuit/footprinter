import { expect, test } from "bun:test"
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

test("sot343 matches the asymmetric C151520 land pattern", () => {
  const circuitJson = fp.string("sot343_rounded0").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(pads[0]).toMatchObject({ x: -0.65, y: -1, width: 0.7, height: 0.7 })
  expect(pads[1]).toMatchObject({ x: 0.5, y: -1, width: 0.9, height: 0.7 })
  expect(pads[2]).toMatchObject({ x: 0.65, y: 1, width: 0.7, height: 0.7 })
  expect(pads[3]).toMatchObject({ x: -0.65, y: 1, width: 0.7, height: 0.7 })

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot343_c151520_asymmetric_emitter_pad",
  )
})
