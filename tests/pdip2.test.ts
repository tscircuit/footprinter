import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { fp } from "../src/footprinter"

test("pdip8 produces same circuit json as dip8", () => {
  const pdipJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const dipJson = fp.string("dip8").circuitJson() as AnyCircuitElement[]
  expect(pdipJson).toEqual(dipJson)
})
