import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123", () => {
  const soup = fp.string("sod123").circuitJson()
  const silkscreenText = soup.find(
    (element) => element.type === "pcb_silkscreen_text",
  )
  const svgContent = convertCircuitJsonToPcbSvg(soup)

  expect(silkscreenText?.font_size).toBe(0.3)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123")
})
