import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smdgdt3 matches the C78322 three-electrode GDT", () => {
  const circuitJson = fp.string("smdgdt3").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(3)
  expect(pads).toMatchObject([
    { port_hints: ["1"], x: -3.3, width: 1.8, height: 5.8 },
    { port_hints: ["2"], x: 0, width: 2.4, height: 5.8 },
    { port_hints: ["3"], x: 3.3, width: 1.8, height: 5.8 },
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "smdgdt3_c78322",
  )
})
