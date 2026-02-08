import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("jst4", () => {
  const circuitJson = fp.string("jst4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  const pads = circuitJson.filter((el: any) => el.type === "pcb_plated_hole")
  expect(pads.length).toBe(4)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path + "jst4")
})
