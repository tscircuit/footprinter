import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("qfn32 with thermalpad generates 33 pads", () => {
  const soup = fp.string("qfn32_thermalpad").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(33)
})
