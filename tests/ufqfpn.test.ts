import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("ufqfpn20 matches C35556", () => {
  const circuitJson = fp.string("ufqfpn20").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  const polygonPads = pads.filter((pad) => pad.shape === "polygon")
  const rectangularPads = pads.filter((pad) => pad.shape === "rect")

  expect(pads).toHaveLength(20)
  expect(polygonPads).toHaveLength(8)
  expect(rectangularPads).toHaveLength(12)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "ufqfpn20_c35556_chamfered_corner_pads",
  )
})
