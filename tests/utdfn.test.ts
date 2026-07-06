import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("UTDFN-4-EP(1x1) alias", () => {
  const circuitJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(5)
  expect(circuitJson).toEqual(fp.string("utdfn4_w1mm_h1mm_ep").circuitJson())
})

test("utdfn4_w1mm_h1mm_ep", () => {
  const circuitJson = fp.string("utdfn4_w1mm_h1mm_ep").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)

  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4_w1mm_h1mm_ep")
})
