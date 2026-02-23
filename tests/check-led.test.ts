import { describe, expect, it } from "bun:test"
import { fp } from "../src/footprinter"
describe("led-check", () => {
  it("led should work", () => {
    const circuitJson = fp.led().circuitJson()
    expect(circuitJson.length).toBeGreaterThan(0)
  })
})
