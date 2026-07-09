import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { tripad } from "../src/fn/tripad"

test("tripad direct call with custom params", () => {
  const result = tripad({ fn: "tripad", w: "6mm", h: "5mm", p: "3mm" })
  const pads = result.circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(3)
  const svgContent = convertCircuitJsonToPcbSvg(result.circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tripad_custom_call")
})
