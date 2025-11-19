import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { getTestFixture } from "./fixtures/get-test-fixture"

const expectPad = (
  circuitJson: any[],
  shape: string,
  size: number | { width: number; height: number },
) => {
  const pad = circuitJson[0]
  expect(pad.type).toBe("pcb_smtpad")
  expect(pad.layer).toBe("top")
  expect(pad.shape).toBe(shape)
  if (shape === "circle") {
    expect(pad.radius).toBeCloseTo(typeof size === "number" ? size : 0)
  } else if (shape === "pill") {
    const { width, height } = size as { width: number; height: number }
    expect(pad.width).toBeCloseTo(width)
    expect(pad.height).toBeCloseTo(height)
    expect(pad.radius).toBeCloseTo(height / 2) // pill pads have radius = height / 2
  } else {
    const { width, height } = size as { width: number; height: number }
    expect(pad.width).toBeCloseTo(width)
    expect(pad.height).toBeCloseTo(height)
  }
}

test("smtpad circle diameter noref", async () => {
  const { snapshotSoup } = await getTestFixture("smtpad_circle_d1.2")
  const circuitJson = fp()
    .smtpad()
    .circle()
    .d("1.2mm")
    .noref(true)
    .circuitJson()
  expectPad(circuitJson, "circle", 0.6)
  snapshotSoup(circuitJson)
})
