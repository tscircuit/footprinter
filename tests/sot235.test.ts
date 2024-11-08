import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot235", () => {
  const soup = fp.string("sot235").circuitJson()
  console.log(soup)
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot235")
})
