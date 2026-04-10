import { test, expect } from "bun:test"
import { bgaRowLabel } from "../src/helpers/zod/ALPHABET"

test("bgaRowLabel produces double letters after Z", () => {
  expect(bgaRowLabel(26)).toBe("AA")
  expect(bgaRowLabel(27)).toBe("AB")
  expect(bgaRowLabel(51)).toBe("AZ")
  expect(bgaRowLabel(52)).toBe("BA")
  expect(bgaRowLabel(77)).toBe("BZ")
  expect(bgaRowLabel(78)).toBe("CA")
})
