import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { fp } from "../src/footprinter"

test("spdip28 uses 0.6in row spacing", () => {
  const json = fp.string("spdip28").json()

  expect(json).toMatchObject({
    fn: "spdip",
    num_pins: 28,
    p: 2.54,
    w: 15.24,
  })
})

test("spdip28 creates 28 plated holes", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const platedHoles = circuitJson.filter(
    (elm) => elm.type === "pcb_plated_hole",
  )

  expect(platedHoles).toHaveLength(28)
})
