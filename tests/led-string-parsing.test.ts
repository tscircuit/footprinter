import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led0402 string produces 2 SMT pads with correct imperial size", () => {
  const soup = fp.string("led0402").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  const pad1 = pads.find((p: any) => p.port_hints?.includes("1"))
  const pad2 = pads.find((p: any) => p.port_hints?.includes("2"))
  expect(pad1).toBeDefined()
  expect(pad2).toBeDefined()
  expect(pad1!.width).toBeCloseTo(0.54, 1)
  expect(pad1!.height).toBeCloseTo(0.64, 1)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "led0402_string")
})
