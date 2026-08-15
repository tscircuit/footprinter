import { test, expect } from "bun:test"
import { fp } from "../src"

test("vson8 bare string renders 8 pads without throwing (#782)", () => {
  const circuitJson = fp.string("vson8").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(8)
})

test("vson bare string defaults to 8 pads", () => {
  const circuitJson = fp.string("vson").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtpads.length).toBe(8)
})
