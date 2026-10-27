import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("polarized capacitor fabrication marks follow actual pads and footprint transforms", () => {
  for (const size of ["0201", "0805", "1206", "2512"]) {
    for (const tht of [false, true]) {
      for (const positivePin of [1, 2]) {
        for (const side of [
          "leftside",
          "topside",
          "rightside",
          "bottomside",
        ] as const) {
          const alignment =
            side === "leftside" || side === "rightside" ? "top" : "left"
          const suffix = `_positivepin${positivePin}_pin1location(${side},${alignment})`
          const neutral = fp
            .string(`cap${size}_nonpolarized${suffix}`)
            .tht(tht)
            .origin("pin1")
            .circuitJson()
          const polarized = fp
            .string(`cap${size}_polarized${suffix}`)
            .tht(tht)
            .origin("pin1")
            .circuitJson()
          const pads = polarized.filter(
            (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
          )
          const positive = pads.find((pad) =>
            pad.port_hints?.includes(String(positivePin)),
          )!
          const negative = pads.find((pad) =>
            pad.port_hints?.includes(String(3 - positivePin)),
          )!
          const paths = polarized.filter(
            (e) => e.type === "pcb_fabrication_note_path",
          )
          expect(paths).toHaveLength(3)
          const plus = paths.filter((path) =>
            path.pcb_fabrication_note_path_id.startsWith(
              "capacitor_fabrication_note_positive",
            ),
          )
          expect(plus).toHaveLength(2)
          const plusDirections = plus.map((path) => ({
            x: path.route[1]!.x - path.route[0]!.x,
            y: path.route[1]!.y - path.route[0]!.y,
          }))
          expect(
            plusDirections[0]!.x * plusDirections[1]!.x +
              plusDirections[0]!.y * plusDirections[1]!.y,
          ).toBeCloseTo(0)

          expect(
            neutral.filter((e) => e.type.startsWith("pcb_fabrication_note")),
          ).toHaveLength(0)
          expect(pads).toEqual(
            neutral.filter(
              (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
            ),
          )
          for (const path of paths) {
            const positiveMark = path.pcb_fabrication_note_path_id.startsWith(
              "capacitor_fabrication_note_positive",
            )
            const pad = positiveMark ? positive : negative
            expect(path.layer).toBe("top")
            expect(path.route).toHaveLength(2)
            expect((path.route[0]!.x + path.route[1]!.x) / 2).toBeCloseTo(pad.x)
            expect((path.route[0]!.y + path.route[1]!.y) / 2).toBeCloseTo(pad.y)
          }
          const minus = paths.find(
            (p) =>
              p.pcb_fabrication_note_path_id ===
              "capacitor_fabrication_note_negative",
          )!
          const mark = {
            x: minus.route[1]!.x - minus.route[0]!.x,
            y: minus.route[1]!.y - minus.route[0]!.y,
          }
          const terminals = {
            x: positive.x - negative.x,
            y: positive.y - negative.y,
          }
          expect(mark.x * terminals.y - mark.y * terminals.x).toBeCloseTo(0)
          if (size === "0805" && (!tht || side === "leftside")) {
            expect(convertCircuitJsonToPcbSvg(polarized)).toMatchSvgSnapshot(
              import.meta.path,
              `cap-fab-${positivePin}-${side}-${tht ? "tht" : "smd"}`,
            )
          }
        }
      }
    }
  }
  const hiddenSilkscreen = fp
    .string("cap0805_polarized_nosilkscreen_negativepin1")
    .circuitJson()
  expect(
    hiddenSilkscreen.filter((e) => e.type.startsWith("pcb_silkscreen")),
  ).toHaveLength(0)
  expect(
    hiddenSilkscreen.filter((e) => e.type === "pcb_fabrication_note_path"),
  ).toHaveLength(3)
  expect(convertCircuitJsonToPcbSvg(hiddenSilkscreen)).toMatchSvgSnapshot(
    import.meta.path,
    "cap-fab-nosilkscreen",
  )
  expect(fp.string("cap0805_polarized_negativepin1").circuitJson()).toEqual(
    fp.string("cap0805_polarized_positivepin2_negativepin1").circuitJson(),
  )
  for (const definition of [
    "cap0805",
    "cap0805_nonpolarized",
    "cap0805_polarizedfalse",
  ]) {
    expect(
      fp
        .string(definition)
        .circuitJson()
        .filter((e) => e.type.startsWith("pcb_fabrication_note")),
    ).toHaveLength(0)
  }
})
