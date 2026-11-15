import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("0603 custom pad size", () => {
  const circuitJson = fp.string("0603_pw1.0_ph1.1").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)
  for (const pad of pads) {
    expect(pad).toMatchObject({ width: 1, height: 1.1 })
  }
  expect(pads.map((pad) => pad.x)).toEqual([-0.825, 0.825])
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "0603_pw1.0_ph1.1")
})
