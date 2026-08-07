import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("string builder ignores empty segments", () => {
  expect(() => fp.string("0603__").circuitJson()).not.toThrow()
})

test("string builder parses negative parameter values", () => {
  expect(fp.string("rj45_holey-3.43mm").json().holey).toBe(-3.43)
})

test("string builder parses pin-indexed parameter names", () => {
  const parameters = fp
    .string("led2835_p1w2.33mm_p2w1.1mm_ph2.38mm_p1x-0.78mm_p2x1.395mm")
    .json()

  expect(parameters).toMatchObject({
    p1w: 2.33,
    p2w: 1.1,
    ph: 2.38,
    p1x: -0.78,
    p2x: 1.395,
  })
})

test("pin-indexed parameters do not change grid value parsing", () => {
  const parameters = fp.string("bga8_grid3x3_p1mm").json()

  expect(parameters.grid).toEqual({ x: 3, y: 3 })
  expect(parameters.p).toBe(1)
})

test("string builder parses full pin-indexed parameter names", () => {
  const parameters = fp
    .string("sot343_pin2padlength0.9mm_pin2padcenteroffsetx-0.15mm")
    .json()

  expect(parameters).toMatchObject({
    pin2padlength: "0.9mm",
    pin2padcenteroffsetx: "-0.15mm",
  })
})
