import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst_ph_4 generates 4 pads", () => {
  const circuitJson = fp.string("jst_ph_4").circuitJson()

  const platedHoles = circuitJson.filter((e) => e.type === "pcb_plated_hole")
  expect(platedHoles.length).toBe(4)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path)
})
