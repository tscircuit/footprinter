import { test, expect } from "bun:test"
import { bgaRowLabel, ALPHABET } from "../src/helpers/zod/ALPHABET"

test("bgaRowLabel matches ALPHABET for rows 0-25", () => {
  for (let i = 0; i < 26; i++) {
    expect(bgaRowLabel(i)).toBe(ALPHABET[i])
  }
})
