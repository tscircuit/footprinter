import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const cases = [
  ["soic8_thermalpad2.4x3mm", 2.4, 3],
  ["dfn8_thermalpad2.4x3mm", 2.4, 3],
  ["tssop8_thermalpad2x2.4mm", 2, 2.4],
  ["ssop8_thermalpad2x2.4mm", 2, 2.4],
  ["msop8_thermalpad1.8x2mm", 1.8, 2],
  ["vssop8_thermalpad1.8x2mm", 1.8, 2],
] as const

for (const [footprint, width, height] of cases) {
  test(`${footprint} adds a rectangular center thermal pad`, () => {
    const soup = fp.string(footprint).circuitJson()
    const pads = soup.filter((element) => element.type === "pcb_smtpad")
    const thermalPad = pads.find((pad) => pad.port_hints.includes("thermalpad"))

    expect(pads).toHaveLength(9)
    expect(thermalPad).toMatchObject({
      shape: "rect",
      x: 0,
      y: 0,
      width,
      height,
      port_hints: ["thermalpad"],
    })

    const svgContent = convertCircuitJsonToPcbSvg(soup)
    expect(svgContent).toMatchSvgSnapshot(import.meta.path, footprint)
  })
}
