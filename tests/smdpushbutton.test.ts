import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("smdpushbutton4 creates row-numbered switch pads", () => {
  const circuitJson = fp
    .string("smdpushbutton4_px4.2mm_py2.15mm_pw1.05mm_ph0.7mm")
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
    { x: -2.1, y: 1.075, width: 1.05, height: 0.7, port_hints: ["1"] },
    { x: 2.1, y: 1.075, width: 1.05, height: 0.7, port_hints: ["2"] },
    { x: -2.1, y: -1.075, width: 1.05, height: 0.7, port_hints: ["3"] },
    { x: 2.1, y: -1.075, width: 1.05, height: 0.7, port_hints: ["4"] },
  ])
})
