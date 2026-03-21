import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 with custom pad size w/h", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_w2_h1")
  const circuitJson = fp().customsmd3().w("2mm").h("1mm").circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  for (const pad of pads) {
    expect(pad.width).toBeCloseTo(2)
    expect(pad.height).toBeCloseTo(1)
  }
})
