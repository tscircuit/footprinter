import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

test("pdip and spdip aliases render the standard DIP layout (#371)", () => {
  for (const name of ["pdip8", "spdip8", "pdip16"]) {
    const circuitJson = fp.string(name).circuitJson()
    const pads = circuitJson.filter(
      (el: any) => el.type === "pcb_plated_hole" || el.type === "pcb_smtpad",
    )
    const expected = Number.parseInt(name.replace(/\D/g, ""), 10)
    expect(pads.length, `${name} should render ${expected} pads`).toBe(expected)
  }

  // same geometry as the equivalent dip footprint
  const pdip = fp.string("pdip8").circuitJson()
  const dip = fp.string("dip8").circuitJson()
  const xs = (j: any) =>
    j
      .filter((el: any) => el.type === "pcb_plated_hole")
      .map((el: any) => el.x)
      .sort()
  expect(xs(pdip)).toEqual(xs(dip))
})
