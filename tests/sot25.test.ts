import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot25", () => {
  const circuitJson = fp.string("sot25").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot25")
})

test("sot25 supports an exact copper span and 180 degree rotation", () => {
  const circuitJson = fp
    .string("sot25_p0.95mm_w3.2mm_pw0.6mm_pl1mm_rot180")
    .circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )

  expect(
    pads.map(({ port_hints, x, y, width, height }) => ({
      port_hints,
      x,
      y,
      width,
      height,
    })),
  ).toEqual([
    { port_hints: ["1"], x: 1.1, y: -0.95, width: 1, height: 0.6 },
    { port_hints: ["2"], x: 1.1, y: -0, width: 1, height: 0.6 },
    { port_hints: ["3"], x: 1.1, y: 0.95, width: 1, height: 0.6 },
    { port_hints: ["4"], x: -1.1, y: 0.95, width: 1, height: 0.6 },
    { port_hints: ["5"], x: -1.1, y: -0.95, width: 1, height: 0.6 },
  ])
})
