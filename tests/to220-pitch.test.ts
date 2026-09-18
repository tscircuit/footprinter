import { expect, test } from "bun:test"
import { fp } from "src/footprinter"
import { to220 } from "src/fn/to220"

/**
 * TO-220 lead pitch is fixed by JEDEC at 0.1in (2.54mm). It used to be derived
 * from the plastic body width (`max(2.5, w * 0.4 / (numPins - 1))` → 2.6mm at
 * the default w=13mm), and the declared `p` parameter (default "5.0mm") was
 * parsed but never read.
 *
 * Issue #790: pitch must be the standard 2.54mm regardless of body width, with
 * `p` honored as an explicit override — matching the sibling `to220f`, which
 * already hardcodes 2.54mm "to match KiCad".
 */

const holeXs = (cj: any[]) =>
  cj
    .filter((e: any) => e.type === "pcb_plated_hole")
    .map((e: any) => e.x)
    .sort((a, b) => a - b)

const gaps = (xs: number[]) =>
  xs.slice(1).map((x, i) => Math.round((x - xs[i]!) * 1e6) / 1e6)

test("to220_3 uses the standard 2.54mm JEDEC pitch by default", () => {
  const xs = holeXs(fp.string("to220_3").circuitJson())
  expect(xs).toHaveLength(3)
  expect(gaps(xs)).toEqual([2.54, 2.54])
})

test("declared p parameter overrides the pitch", () => {
  const xs = holeXs(
    to220({ fn: "to220", num_pins: 3, p: "5mm" }).circuitJson as any,
  )
  expect(gaps(xs)).toEqual([5, 5])
})

test("pitch does not scale with body width", () => {
  const xs = holeXs(
    to220({ fn: "to220", num_pins: 3, w: "25.4mm" }).circuitJson as any,
  )
  expect(gaps(xs)).toEqual([2.54, 2.54])
})

test("even pin counts stay centered at the standard pitch", () => {
  const xs = holeXs(fp.string("to220_4").circuitJson())
  expect(xs).toHaveLength(4)
  expect((xs[0]! + xs[xs.length - 1]!) / 2).toBeCloseTo(0, 9)
  expect(gaps(xs)).toEqual([2.54, 2.54, 2.54])
})

test("5-pin variant uses the standard pitch", () => {
  const xs = holeXs(fp.string("to220_5").circuitJson())
  expect(gaps(xs)).toEqual([2.54, 2.54, 2.54, 2.54])
})

test("reported parameters reflect the effective pitch", () => {
  const { parameters } = to220({ fn: "to220", num_pins: 3 })
  expect(parameters.p).toBe(2.54)
})
