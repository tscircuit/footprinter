import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smd3225_4p creates a counter-clockwise 2x2 pad layout", () => {
  const circuitJson = fp
    .string("smd3225_4p")
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -1.1, y: -0.85, width: 1.4, height: 1.2, port_hints: ["1"] },
    { x: 1.1, y: -0.85, width: 1.4, height: 1.2, port_hints: ["2"] },
    { x: 1.1, y: 0.85, width: 1.4, height: 1.2, port_hints: ["3"] },
    { x: -1.1, y: 0.85, width: 1.4, height: 1.2, port_hints: ["4"] },
  ])

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "smd3225_4p")
})