import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src"

test.each(["bga20", "bga10", "bga20_grid4x4", "bga20_grid4x5_missing(A1)"])(
  "%s rejects a layout that disagrees with its pin count",
  (definition) => {
    expect(() => fp.string(definition).circuitJson()).toThrow(
      "BGA pin count mismatch",
    )
  },
)

test("BGA builder explains how to resolve an ambiguous pin count", () => {
  expect(() => fp().bga(20).circuitJson()).toThrow(
    "requested 20 pins, but the 5x5 grid with missing sites produces 25 pads",
  )
})

test.each([
  ["bga20_grid4x5", 20],
  ["bga20_grid5x5_missing(A1,A2,A3,A4,A5)", 20],
  ["bga8", 8],
  ["bga32", 32],
] as const)("%s preserves the requested pad count", (definition, count) => {
  const elements = fp.string(definition).circuitJson()
  const pads = elements.filter((element) => element.type === "pcb_smtpad")
  expect(pads).toHaveLength(count)
  expect(new Set(pads.map((pad) => pad.port_hints?.[0])).size).toBe(count)
  expect(
    convertCircuitJsonToPcbSvg(elements, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, `pin_count_${definition}`)
})
