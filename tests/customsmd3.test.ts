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

test("customsmd3 with c2cvert (center-to-center vertical distance)", async () => {
  const { snapshotSoup } = await getTestFixture("customsmd3_c2cvert_2_3_2mm")
  const circuitJson = fp().customsmd3().c2cvert_2_3("2mm").circuitJson()
  snapshotSoup(circuitJson)

  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  const pin2 = pads.find((p: any) => p.port_hints?.includes("2"))!
  const pin3 = pads.find((p: any) => p.port_hints?.includes("3"))!

  expect(Math.abs(pin2.y - pin3.y)).toBeCloseTo(2)
})

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

test("customsmd3 has courtyard", () => {
  const circuitJson = fp().customsmd3().circuitJson()
  const courtyard = circuitJson.find(
    (el: any) => el.type === "pcb_courtyard_rect",
  )
  expect(courtyard).toBeDefined()
})

test("customsmd3 from string - default", () => {
  const circuitJson = fp.string("customsmd3").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
})

test("customsmd3 from string - with w and h", () => {
  const circuitJson = fp.string("customsmd3_w2_h1").circuitJson()
  const pads = circuitJson.filter((el: any) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  for (const pad of pads) {
    expect(pad.width).toBeCloseTo(2)
    expect(pad.height).toBeCloseTo(1)
  }
})
