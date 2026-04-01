import { test, expect } from "bun:test"
import type { PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("bga 30x30 grid has valid row labels beyond Z", () => {
  const soup = fp.string("bga900_grid30x30_p0.5").circuitJson()
  const pads = soup.filter((el): el is PcbSmtPad => el.type === "pcb_smtpad")

  expect(pads).toHaveLength(900)

  // No pad should have "undefined" in its label
  for (const pad of pads) {
    expect(pad.port_hints?.[1]).not.toContain("undefined")
  }

  // Row 0 = A, Row 25 = Z (single letters)
  const pinA1 = pads.find((p) => p.port_hints?.[0] === "1")
  expect(pinA1?.port_hints?.[1]).toBe("A1")

  const pinZ1 = pads.find((p) => p.port_hints?.[1] === "Z1")
  expect(pinZ1).toBeDefined()

  // Row 26 = AA, Row 27 = AB (double letters)
  const pinAA1 = pads.find((p) => p.port_hints?.[1] === "AA1")
  expect(pinAA1).toBeDefined()

  const pinAB1 = pads.find((p) => p.port_hints?.[1] === "AB1")
  expect(pinAB1).toBeDefined()

  // Row 29 = AD (last row of a 30x30 grid)
  const pinAD1 = pads.find((p) => p.port_hints?.[1] === "AD1")
  expect(pinAD1).toBeDefined()

  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "bga_30x30_large_grid",
  )
})
