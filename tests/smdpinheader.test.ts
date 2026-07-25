import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smdpinheader6 creates alternating vertical SMT header pads", () => {
  const footprint = fp.string("smdpinheader6")
  const parameters = footprint.json()
  const circuitJson = footprint.circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(parameters).toMatchObject({
    fn: "smdpinheader",
    num_pins: 6,
    p: 2.54,
    py: 3.31,
    pw: 1,
    ph: 2.51,
    bh: 2.5,
    male: true,
    female: false,
    smd: true,
  })
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -6.35, y: 1.655, width: 1, height: 2.51, port_hints: ["1"] },
    { x: -3.81, y: -1.655, width: 1, height: 2.51, port_hints: ["2"] },
    { x: -1.27, y: 1.655, width: 1, height: 2.51, port_hints: ["3"] },
    { x: 1.27, y: -1.655, width: 1, height: 2.51, port_hints: ["4"] },
    { x: 3.81, y: 1.655, width: 1, height: 2.51, port_hints: ["5"] },
    { x: 6.35, y: -1.655, width: 1, height: 2.51, port_hints: ["6"] },
  ])
  expect(
    circuitJson.some((element) => element.type === "pcb_plated_hole"),
  ).toBe(false)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson, {
    showCourtyards: true,
  })
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "smdpinheader6")
})
