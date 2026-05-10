import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 circular pads with radius", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_r0.5")
  const circuitJson = fp().customsmd3().r("0.5mm").circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  for (const pad of pads) {
    expect(pad.shape).toBe("circle")
    expect(pad.radius).toBeCloseTo(0.5)
  }
})
