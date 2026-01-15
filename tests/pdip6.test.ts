import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("PDIP8 string resolves using lowercase function", () => {
  const uppercaseJson = fp.string("PDIP8").json()
  const lowercaseJson = fp.string("pdip8").json()
  expect(uppercaseJson).toEqual(lowercaseJson)
})
