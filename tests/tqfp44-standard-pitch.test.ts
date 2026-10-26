import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("tqfp44 defaults to JEDEC MS-026 0.8mm pitch and 0.55mm pad width", () => {
  const json = fp.string("tqfp44").json()
  expect(json.p).toBe(0.8)
  expect(json.pw).toBe(0.55)
  expect(json.pl).toBe(1.475)
  expect(json.w).toBe(12)

  const circuitJson = fp.string("tqfp44").circuitJson()
  const smtPads = circuitJson.filter((e) => e.type === "pcb_smtpad")
  expect(smtPads).toHaveLength(44)
})

test("tqfp44 honors explicit overrides", () => {
  const json = fp.string("tqfp44_p0.5mm_pw0.3mm").json()
  expect(json.p).toBe(0.5)
  expect(json.pw).toBe(0.3)
})
