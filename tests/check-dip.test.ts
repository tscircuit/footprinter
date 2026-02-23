import { describe, expect, it } from "bun:test"
import { fp } from "../src/footprinter"
describe("dip-check", () => {
  it("dip should work", () => {
    const circuitJson = fp.dip(8).circuitJson()
    expect(circuitJson.length).toBeGreaterThan(0)
  })
})
