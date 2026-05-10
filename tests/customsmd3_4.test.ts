import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 with position specifiers (leftmost=2)", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_leftmostn2")
  const circuitJson = fp()
    .customsmd3()
    .leftmostn(2)
    .topmostn(1)
    .bottommostn(3)
    .circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  const pin2 = pads.find((p: any) => p.port_hints?.includes("2"))!
  const pin1 = pads.find((p: any) => p.port_hints?.includes("1"))!

  // Pin 2 is leftmost, so its x should be less than pin 1
  expect(pin2.x).toBeLessThan(pin1.x)
})
