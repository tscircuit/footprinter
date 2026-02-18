import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("qfn32 pad width scales with pitch", () => {
  const soup = fp.string("qfn32_p0.4").circuitJson()
  const pads = soup.filter((e: any) => e.type === "pcb_smtpad")
  // With pitch 0.4, pw should be 0.4 * 0.5 = 0.2
  const firstPad = pads[0] as any
  const padWidth = Math.min(firstPad.width, firstPad.height)
  expect(padWidth).toBeCloseTo(0.2, 2)
})
