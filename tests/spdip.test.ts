import { expect, test } from "bun:test"
import { footprinter, string } from "src/footprinter"

const holes = (circuitJson: any[]) =>
  circuitJson.filter((e) => e.type === "pcb_plated_hole")

test("spdip28 defaults to a 28-pin 7.62mm x 2.54mm layout", () => {
  const pads = holes(string("spdip28").circuitJson())

  expect(pads).toHaveLength(28)
  expect(pads[0].x).toBeCloseTo(-3.81)
  expect(pads[0].y).toBeCloseTo(16.51)
  expect(pads[13].y).toBeCloseTo(-16.51)
  expect(pads[14].x).toBeCloseTo(3.81)
  expect(pads[14].y).toBeCloseTo(-16.51)
  expect(pads[27].y).toBeCloseTo(16.51)
})

test("SPDIP-28 normalizes to the same geometry as spdip28", () => {
  expect(string("SPDIP-28").circuitJson()).toEqual(
    string("spdip28").circuitJson(),
  )
})

test("spdip builder defaults to 28 pins and supports overrides", () => {
  const fp = footprinter().spdip().w("10.16mm").p("1.27mm")
  const pads = holes(fp.circuitJson())

  expect(pads).toHaveLength(28)
  expect(Math.abs(pads[0].x - pads[14].x)).toBeCloseTo(10.16)
  expect(Math.abs(pads[0].y - pads[1].y)).toBeCloseTo(1.27)
})

test("spdip pin numbering stays counter-clockwise", () => {
  const pads = holes(string("spdip28").circuitJson())

  expect(pads[0].x).toBeLessThan(0)
  expect(pads[13].x).toBeLessThan(0)
  expect(pads[14].x).toBeGreaterThan(0)
  expect(pads[27].x).toBeGreaterThan(0)
})
