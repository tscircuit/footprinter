import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

test("diode0402_metric string uses metric lookup", () => {
  const params = fp.string("diode1005_metric").params()
  expect(params.metric).toBe("1005")
  expect(params.fn).toBe("diode")
})
