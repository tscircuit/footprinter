import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 default layout (1 left, 2 top-right, 3 bottom-right)", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_default")
  const circuitJson = fp().customsmd3().circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)

  // Pin 1 should be leftmost
  const pin1 = pads.find((p: any) => p.port_hints?.includes("1"))!
  const pin2 = pads.find((p: any) => p.port_hints?.includes("2"))!
  const pin3 = pads.find((p: any) => p.port_hints?.includes("3"))!

  expect(pin1.x).toBeLessThan(pin2.x)
  expect(pin1.x).toBeLessThan(pin3.x)

  // Pin 2 should be above pin 3
  expect(pin2.y).toBeGreaterThan(pin3.y)
})
