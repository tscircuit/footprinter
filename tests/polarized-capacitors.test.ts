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
    "cap0603_polarized_positivepin2",
    "cap0603_polarized_negativepin1",
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
    fp.string("cap0603_polarized_positivepin1_negativepin1").circuitJson(),
  ).toThrow()
  expect(() =>
    fp.string("cap0603_nonpolarized_polarized_positivepin1").circuitJson(),
  ).toThrow()
  for (const family of ["electrolytic", "radial_polarized"]) {
    const left = fp.string(family).circuitJson()
    const right = fp.string(`${family}_positivepin2`).circuitJson()
    const plusX = (elements: AnyCircuitElement[]) =>
      elements.filter(
        (e) =>
          e.type === "pcb_silkscreen_path" &&
          e.pcb_silkscreen_path_id.startsWith("polarity_positive_"),
      )
    expect(plusX(left)).toHaveLength(2)
    expect(plusX(left)[0].route[0].x).toBeLessThan(0)
    expect(plusX(right)[0].route[0].x).toBeGreaterThan(0)
    if (family === "electrolytic") {
      const positivePad = right.find(
        (e) => e.type === "pcb_plated_hole" && e.port_hints?.includes("2"),
      )!
      expect(positivePad.shape).toBe("circular_hole_with_rect_pad")
      expect(positivePad.x).toBeGreaterThan(0)
      const pin1 = right.find(
        (e) => e.type === "pcb_plated_hole" && e.port_hints?.includes("1"),
      )!
      expect(pin1.x).toBeLessThan(0)
    }
    snapshot(left, `${family}-positive1`)
    snapshot(right, `${family}-positive2`)
  }
})

test("capacitor polarity rejects conflicting pins and respects nosilkscreen", () => {
  for (const family of [
    "cap0603_polarized",
    "electrolytic",
    "radial_polarized",
  ]) {
    expect(() =>
      fp.string(`${family}_positivepin2_negativepin2`).circuitJson(),
    ).toThrow()
    expect(() => fp.string(`${family}_positivepin3`).circuitJson()).toThrow()
    const elements = fp
      .string(`${family}_positivepin2_nosilkscreen`)
      .circuitJson()
    expect(elements.some((e) => e.type === "pcb_silkscreen_path")).toBeFalse()
    snapshot(elements, `${family}-nosilkscreen`)
  }
  for (const family of ["cap0603", "radial_ceramic"]) {
    const elements = fp.string(family).circuitJson()
    expect(
      elements.some(
        (e) =>
          e.type === "pcb_silkscreen_path" &&
          e.pcb_silkscreen_path_id.startsWith("polarity_positive_"),
      ),
    ).toBeFalse()
    snapshot(elements, `${family}-nonpolarized`)
  }
})
