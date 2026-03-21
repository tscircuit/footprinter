import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("customsmd3 from string - with w and h", () => {
  const circuitJson = fp.string("customsmd3_w2_h1").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  for (const pad of pads) {
    expect(pad.width).toBeCloseTo(2)
    expect(pad.height).toBeCloseTo(1)
  }
})
