import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("diode string matches diode builder API output", () => {
  const fromString = fp.string("diode0603").circuitJson()
  const fromBuilder = fp().diode().imperial("0603").circuitJson()

  const stringPads = fromString.filter((e: any) => e.type === "pcb_smtpad")
  const builderPads = fromBuilder.filter((e: any) => e.type === "pcb_smtpad")

  expect(stringPads).toHaveLength(builderPads.length)

  for (let i = 0; i < stringPads.length; i++) {
    expect(stringPads[i].x).toBeCloseTo(builderPads[i].x, 5)
    expect(stringPads[i].y).toBeCloseTo(builderPads[i].y, 5)
    expect(stringPads[i].width).toBeCloseTo(builderPads[i].width, 5)
    expect(stringPads[i].height).toBeCloseTo(builderPads[i].height, 5)
  }
})
