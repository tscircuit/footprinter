import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("led0402_metric string uses metric lookup", () => {
  const params = fp.string("led1005_metric").params()
  expect(params.metric).toBe("1005")
  expect(params.fn).toBe("led")
})
