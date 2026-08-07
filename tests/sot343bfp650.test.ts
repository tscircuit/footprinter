import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot343bfp650 matches C151520", () => {
  const circuitJson = fp.string("sot343bfp650").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(pads[0]).toMatchObject({ x: -0.65, y: -1, width: 0.7, height: 0.7 })
  expect(pads[1]).toMatchObject({ x: 0.5, y: -1, width: 0.9, height: 0.7 })
  expect(pads[2]).toMatchObject({ x: 0.65, y: 1, width: 0.7, height: 0.7 })
  expect(pads[3]).toMatchObject({ x: -0.65, y: 1, width: 0.7, height: 0.7 })

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot343bfp650_c151520",
  )
})
