import { describe, expect, test } from "bun:test"
import { padDifference } from "../fixtures/padDifference"

test("parity/0402", async () => {
  const diff = await padDifference("0402", "kicad:R_0402_1005Metric")
  expect(diff).toBeLessThan(0.1)
})
test("parity/0603", async () => {
  const diff = await padDifference("0603", "kicad:R_0603_1608Metric")
  expect(diff).toBeLessThan(0.1)
})
