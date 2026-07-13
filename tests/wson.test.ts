import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("wson8_ep creates counter-clockwise pads and exposed pad 9", () => {
  const circuitJson = fp
    .string("wson8_ep_p0.5mm_rowspan3.015mm_pl0.6mm_pw0.28mm_epw1.7mm_eph0.3mm")
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(9)
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -0.75, y: -1.5075, width: 0.28, height: 0.6, port_hints: ["1"] },
    { x: -0.75, y: 1.5075, width: 0.28, height: 0.6, port_hints: ["8"] },
    { x: -0.25, y: -1.5075, width: 0.28, height: 0.6, port_hints: ["2"] },
    { x: -0.25, y: 1.5075, width: 0.28, height: 0.6, port_hints: ["7"] },
    { x: 0.25, y: -1.5075, width: 0.28, height: 0.6, port_hints: ["3"] },
    { x: 0.25, y: 1.5075, width: 0.28, height: 0.6, port_hints: ["6"] },
    { x: 0.75, y: -1.5075, width: 0.28, height: 0.6, port_hints: ["4"] },
    { x: 0.75, y: 1.5075, width: 0.28, height: 0.6, port_hints: ["5"] },
    { x: 0, y: 0, width: 1.7, height: 0.3, port_hints: ["9"] },
  ])
})
