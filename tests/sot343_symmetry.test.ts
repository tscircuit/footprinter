import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"
import { sot343 } from "../src/fn/sot343"

test("sot343 pads are symmetric about origin", () => {
  const circuitJson = fp.string("sot343").circuitJson()
  const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
  const xs = pads.map((p) => p.x).sort((a, b) => a - b)
  expect(xs.length).toBe(4)
  expect(xs[0]).toBeCloseTo(-xs[3], 6)
  expect(xs[1]).toBeCloseTo(-xs[2], 6)
  expect(Math.abs(xs[0])).toBeCloseTo(Math.abs(xs[3]), 6)
})

test("sot343_4 pin count parses with radix 10", () => {
  const { parameters } = sot343({ fn: "sot343", string: "sot343_4" })
  expect(parameters.num_pins).toBe(4)
})
