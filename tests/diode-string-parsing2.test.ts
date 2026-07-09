import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("diode0805 string produces 2 SMT pads with correct imperial size", () => {
  const soup = fp.string("diode0805").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(2)

  const pad1 = pads.find((p: any) => p.port_hints?.includes("1"))
  expect(pad1!.width).toBeCloseTo(1.025, 2)
  expect(pad1!.height).toBeCloseTo(1.4, 1)

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "diode0805_string")
})
