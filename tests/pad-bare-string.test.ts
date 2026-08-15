import { test, expect } from "bun:test"
import { fp } from "../src"

test("pad bare string defaults to 1mm dimensions (#788)", () => {
  const circuitJson = fp.string("pad").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
  expect(smtpads.length).toBe(1)
  expect(smtpads[0].width).toBe(1)
  expect(smtpads[0].height).toBe(1)
})

test("pad with specified dimensions parses properly", () => {
  const circuitJson = fp.string("pad_w2mm_h3mm").circuitJson()

  const smtpads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
  expect(smtpads.length).toBe(1)
  expect(smtpads[0].width).toBe(2)
  expect(smtpads[0].height).toBe(3)
})
