import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

// Regression test for issue #562:
// diode0603 should produce the same footprint structure as cap0603.

test("diode0603 matches cap0603 dimensions", () => {
  const diodePads = fp
    .string("diode0603")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ width, height, x, y }) => ({ width, height, x, y }))
  const capacitorPads = fp
    .string("cap0603")
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
    .map(({ width, height, x, y }) => ({ width, height, x, y }))

  expect(diodePads).toEqual(capacitorPads)
})
