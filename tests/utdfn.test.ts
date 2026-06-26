import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("utdfn4 (UTDFN-4-EP 1x1)", () => {
  const circuitJson = fp.string("utdfn4").circuitJson() as AnyCircuitElement[]
  // 4 signal pads + 1 exposed pad + silkscreen paths + ref + courtyard
  expect(circuitJson.length).toBeGreaterThan(0)
  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(5) // 4 pins + EP
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4")
})
