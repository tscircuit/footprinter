import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("sot235 alias resolves to sot23_5", () => {
  const circuitJson = fp.string("sot235").circuitJson()

  const smtpad = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpad).toBeDefined()
  expect(smtpad.length).toBe(5)
})
