import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smdpotentiometer matches C78322", () => {
  const circuitJson = fp.string("smdpotentiometer").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(3)
  expect(pads.map(({ x, width, height }) => [x, width, height])).toEqual([
    [-3.3, 1.8, 5.8],
    [0, 2.4, 5.8],
    [3.3, 1.8, 5.8],
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "smdpotentiometer_c78322",
  )
})
