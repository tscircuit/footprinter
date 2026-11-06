import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("m2host", () => {
  const circuitJson = fp.string("m2host").circuitJson()
  const silkscreenText = circuitJson.find(
    (el) => el.type === "pcb_silkscreen_text",
  )
  expect(silkscreenText).toBeDefined()
  expect(
    silkscreenText?.type === "pcb_silkscreen_text"
      ? silkscreenText.text
      : undefined,
  ).toBe("{REF}")
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "m2host")
})
