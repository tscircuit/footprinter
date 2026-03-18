import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("jst_sh_6 generates 6 signal pads", () => {
  const circuitJson = fp.string("jst_sh_6").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  // 6 signal pads + 2 mounting pads
  expect(pads).toHaveLength(8)
})
