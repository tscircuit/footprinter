import { test, expect } from "bun:test"
import { lpcc } from "../src/fn/lpcc"

test("lpcc-32", () => {
  const result = lpcc({
    num_pins: 32,
    p: 0.5,
    w: 5.0,
    h: 5.0,
  })
  expect(result.circuitJson).toMatchSnapshot()
})
