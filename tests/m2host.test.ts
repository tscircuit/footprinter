import { test, expect } from "bun:test"
import type { PCBSMTPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("m2host", () => {
  const circuitJson = fp.string("m2host").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "m2host")
})

test("m2host pads maintain 0.5mm pitch", () => {
  const circuitJson = fp.string("m2host").circuitJson()
  const pads = circuitJson.filter(
    (el): el is PCBSMTPad => el.type === "pcb_smtpad",
  )

  expect(pads.length).toBeGreaterThan(1)

  const pitch = pads[1].y - pads[0].y
  expect(Math.abs(pitch)).toBeCloseTo(0.5)
})
