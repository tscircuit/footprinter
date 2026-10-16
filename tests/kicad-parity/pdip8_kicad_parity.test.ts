import { expect, test } from "bun:test"
import { compareFootprinterVsKicad } from "../fixtures/compareFootprinterVsKicad"

test("parity/pdip8", async () => {
  const { courtyardDiffPercent } = await compareFootprinterVsKicad(
    "PDIP-8",
    "Package_DIP.pretty/DIP-8_W7.62mm.circuit.json",
  )

  expect(courtyardDiffPercent).toBeLessThan(1)
})
