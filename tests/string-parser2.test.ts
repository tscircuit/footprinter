import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder works for led and diode imperial sizes", () => {
  expect(() => fp.string("led0402").circuitJson()).not.toThrow()
    expect(() => fp.string("led0603").circuitJson()).not.toThrow()
      expect(() => fp.string("diode0402").circuitJson()).not.toThrow()
        expect(() => fp.string("diode0805").circuitJson()).not.toThrow()
        })
