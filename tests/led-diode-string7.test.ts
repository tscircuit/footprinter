import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// led0402 should produce the same footprint structure as res0402.

test("led0402 matches res0402 dimensions", () => {
  const ledPads = fp
    .string("led0402")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ width, height, x, y }) => ({ width, height, x, y }))
  const resistorPads = fp
    .string("res0402")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ width, height, x, y }) => ({ width, height, x, y }))

  expect(ledPads).toEqual(resistorPads)
})
