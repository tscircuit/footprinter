import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("customsmd3 from string - default", () => {
  const circuitJson = fp.string("customsmd3").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
})
