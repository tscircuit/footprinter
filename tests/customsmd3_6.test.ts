import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

test("customsmd3 with e2ehorz (edge-to-edge horizontal distance)", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_e2ehorz_1_2_3mm")
  const circuitJson = fp()
    .customsmd3()
    .w("1.5mm")
    .h("1mm")
    .e2ehorz_1_2("3mm")
    .circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  const pin1 = pads.find((p: any) => p.port_hints?.includes("1"))!
  const pin2 = pads.find((p: any) => p.port_hints?.includes("2"))!

  // edge-to-edge = center-to-center - padW
  const edge2edge = Math.abs(pin2.x - pin1.x) - pin1.width
  expect(edge2edge).toBeCloseTo(3)
})
