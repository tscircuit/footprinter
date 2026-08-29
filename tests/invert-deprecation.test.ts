import { expect, test } from "bun:test"
import { base_def } from "../src/helpers/zod/base_def"

test("invert remains parseable but points to explicit pin-header props", () => {
  expect(base_def.parse({ invert: true }).invert).toBe(true)

  const description = base_def.shape.invert.description
  expect(description).toContain("DEPRECATED")
  expect(description).toContain("connectsFromAbove")
  expect(description).toContain("connectsFromBelow")
})
