import { test, expect } from "bun:test"
import { led2835 } from "../src/fn/led2835"

test("led2835", () => {
  const result = led2835({})
  expect(result.circuitJson).toMatchSnapshot()
})
