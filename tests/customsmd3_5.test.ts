import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 with c2cvert (center-to-center vertical distance)", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_c2cvert_2_3_2mm")
  const circuitJson = fp().customsmd3().c2cvert_2_3("2mm").circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  const pin2 = pads.find((p: any) => p.port_hints?.includes("2"))!
  const pin3 = pads.find((p: any) => p.port_hints?.includes("3"))!

  expect(Math.abs(pin2.y - pin3.y)).toBeCloseTo(2)
})
