import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("qfn32 generates correct number of pads", () => {
  const soup = fp.string("qfn32").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(32)
})
