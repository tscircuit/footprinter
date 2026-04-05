import { test, expect } from "bun:test"
import { footprinter } from "../src/footprinter"

test("string builder works for led and diode imperial sizes", () => {
    expect(() => footprinter.string("led0402").circuitJson()).not.toThrow()
    expect(() => footprinter.string("led0603").circuitJson()).not.toThrow()
    expect(() => footprinter.string("diode0402").circuitJson()).not.toThrow()
    expect(() => footprinter.string("diode0805").circuitJson()).not.toThrow()
})
