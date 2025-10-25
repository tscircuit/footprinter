import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("TQFP64 has correct defaults vs QFP64", () => {
  const tqfpParams = fp.string("TQFP64").json() as any
  const qfpParams = fp.string("QFP64").json() as any

  expect(tqfpParams.num_pins).toBe(64)
  expect(qfpParams.num_pins).toBe(64)

  expect(tqfpParams.p).toBe(0.5)
  expect(qfpParams.p).toBe(0.8)

  expect(tqfpParams.pw).toBe(0.3)
  expect(qfpParams.pw).toBe(0.5)

  expect(tqfpParams.pl).toBe(1.475)
  expect(qfpParams.pl).toBe(2.25)
})
