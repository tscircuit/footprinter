import { expect, test } from "bun:test"
import { pdip } from "../src/fn/pdip"

test("pdip (default 8 pins)", () => {
  const result = pdip({ num_pins: 8 })
  expect(result.circuitJson).toMatchSnapshot()

  // Verify 8 plated holes + silkscreen + courtyard + reftext + pin silkscreens
  expect(
    result.circuitJson.filter((c) => c.type === "pcb_plated_hole"),
  ).toHaveLength(8)
})

test("pdip (16 pins)", () => {
  const result = pdip({ num_pins: 16 })
  expect(result.circuitJson).toMatchSnapshot()
  expect(
    result.circuitJson.filter((c) => c.type === "pcb_plated_hole"),
  ).toHaveLength(16)
})
