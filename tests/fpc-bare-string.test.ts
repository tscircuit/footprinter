import { test, expect } from "bun:test"
import { fp } from "../src"

test("fpc bare string defaults to 12 pins without throwing (#786)", () => {
  const circuitJson = fp.string("fpc").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  // 12 contact pads + 2 mounting pads = 14 pads
  expect(smtpads.length).toBe(14)
})

test("fpc with explicit pin count parses correctly", () => {
  const circuitJson = fp.string("fpc6").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  // 6 contact pads + 2 mounting pads = 8 pads
  expect(smtpads.length).toBe(8)
})
