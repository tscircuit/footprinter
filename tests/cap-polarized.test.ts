import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { passive_def } from "../src/helpers/passive-fn"

const marks = (elements: AnyCircuitElement[]) =>
  elements.filter(
    (e): e is PcbSilkscreenPath =>
      e.type === "pcb_silkscreen_path" &&
      e.pcb_silkscreen_path_id.startsWith("capacitor_polarity_plus_"),
  )
const snapshot = (elements: AnyCircuitElement[], name: string) =>
  expect(convertCircuitJsonToPcbSvg(elements)).toMatchSvgSnapshot(
    import.meta.path,
    `cap-polarized-${name}`,
  )

for (const size of ["0201", "0603", "1206", "2512"]) {
  test(`cap${size} adds an opt-in plus beside pin 1 without changing copper`, () => {
    const normal = fp.string(`cap${size}`).circuitJson()
    const polarized = fp.string(`cap${size}_polarized`).circuitJson()
    expect(marks(normal)).toHaveLength(0)
    expect(marks(polarized)).toHaveLength(2)
    expect(polarized.filter((e) => e.type === "pcb_smtpad")).toEqual(
      normal.filter((e) => e.type === "pcb_smtpad"),
    )
    const pin1 = polarized.find(
      (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
    )!
    for (const mark of marks(polarized)) {
      expect(mark.stroke_width).toBe(0.15)
      for (const point of mark.route)
        expect(point.x + 0.075).toBeLessThanOrEqual(
          pin1.x - pin1.width / 2 - 0.25,
        )
    }
    snapshot(normal, `${size}-default`)
    snapshot(polarized, `${size}-enabled`)
  })
}

test("capacitor builder, string, and passive schema retain polarized", () => {
  const builder = fp().cap().imperial("0603").polarized().tht(false)
  expect(builder.circuitJson()).toEqual(
    fp.string("cap0603_polarized").tht(false).circuitJson(),
  )
  expect(passive_def.parse(builder.json())).toMatchObject({
    polarized: true,
  })
  const disabled = fp().cap().imperial("0603").polarized(false).circuitJson()
  expect(marks(disabled)).toHaveLength(0)
  snapshot(disabled, "explicitly-disabled")
})

test("polarized through-hole cap retains its two holes and marks positive pin 1", () => {
  const elements = fp().cap().imperial("0603").tht().polarized().circuitJson()
  expect(elements.filter((e) => e.type === "pcb_plated_hole")).toHaveLength(2)
  expect(marks(elements)).toHaveLength(2)
  snapshot(elements, "through-hole")
})

test("capacitor plus follows transforms and respects nosilkscreen", () => {
  const elements = fp
    .string("cap0603_polarized_pin1location(rightside,top)")
    .origin("pin1")
    .circuitJson()
  const pin1 = elements.find(
    (e) => e.type === "pcb_smtpad" && e.port_hints?.includes("1"),
  )!
  expect(pin1.x).toBeCloseTo(0)
  expect(pin1.y).toBeCloseTo(0)
  expect(marks(elements)[0].route[0].x).toBeGreaterThan(0)
  snapshot(elements, "rotated-pin1-origin")
  const hidden = fp.string("cap0603_polarized_nosilkscreen").circuitJson()
  expect(marks(hidden)).toHaveLength(0)
  snapshot(hidden, "nosilkscreen")
  expect(() =>
    fp.string("cap0603_polarized_nonpolarized").circuitJson(),
  ).toThrow("both polarized and nonpolarized")
})
