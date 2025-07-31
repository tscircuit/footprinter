import { describe, expect, test } from "bun:test"
import { padDifference } from "../fixtures/padDifference"

describe("footprintSizes parity tests", () => {
  test("parity/0402", async () => {
    const diff = await padDifference("0402", "kicad:R_0402_1005Metric")
    expect(diff).toBeLessThan(0.1)
  })
})
