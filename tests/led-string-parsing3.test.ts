import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led1206 string produces 2 SMT pads", () => {
  const soup = fp.string("led1206").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led1206_string")
})
