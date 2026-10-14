import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { AnyCircuitElement } from "circuit-json"
import { fp } from "../src/footprinter"

const snapshot = (elements: AnyCircuitElement[], name: string) =>
  expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
    import.meta.path,
    `polarity-${name}`,
  )

test("polarized capacitors expose positive/negative mapping without marking ceramic capacitors", () => {
  for (const name of [
    "cap0603_polarized",
    "cap0603_positivepin2",
    "cap0603_negativepin1",
  ]) {
    const elements = fp.string(name).circuitJson()
    const plus = elements.filter(
      (e) =>
        e.type === "pcb_silkscreen_path" &&
        e.pcb_silkscreen_path_id.startsWith("polarity_positive_"),
    )
    expect(plus).toHaveLength(2)
    expect(Math.sign(plus[0].route[0].x)).toBe(
      name.endsWith("polarized") ? -1 : 1,
    )
    snapshot(elements, name)
  }
  expect(() =>
    fp.string("cap0603_positivepin1_negativepin1").circuitJson(),
  ).toThrow()
  expect(() =>
    fp.string("cap0603_nonpolarized_positivepin1").circuitJson(),
  ).toThrow()
  for (const family of ["electrolytic", "radial_polarized"]) {
    const left = fp.string(family).circuitJson()
    const right = fp.string(`${family}_positivepin2`).circuitJson()
    // Existing plus strokes are the only two-point paths with identical y or x outside the body.
    const plusX = (elements: AnyCircuitElement[]) =>
      elements.filter(
        (e) =>
          e.type === "pcb_silkscreen_path" &&
          e.route.length === 2 &&
          Math.abs(e.route[0].x) > 5,
      )
    expect(plusX(left).length).toBeGreaterThan(0)
    expect(plusX(right)[0].route[0].x).toBeGreaterThan(0)
    snapshot(left, `${family}-positive1`)
    snapshot(right, `${family}-positive2`)
  }
})
