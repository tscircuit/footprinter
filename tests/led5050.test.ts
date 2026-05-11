import { test, expect } from "bun:test"
import { led5050 } from "../src/fn/led5050"

test("led5050", () => {
  const result = led5050({})
  expect(result.circuitJson).toMatchSnapshot()
})
