import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import * as footprints from "../src/fn"
import { fp } from "../src/footprinter"

// Established package defaults: name, pitch, pad length, pad width, and the
// courtyard visibility used by the package's existing SVG snapshot.
const packages = [
  ["melf", 4.8, 1.5, 2.7, false],
  ["micromelf", 1.6, 0.8, 1.2, false],
  ["minimelf", 3.5, 1.3, 1.7, false],
  ["sma", 4, 2.5, 1.8, true],
  ["smb", 4.3, 2.5, 2.3, true],
  ["smc", 6.8, 2.5, 3.3, false],
  ["smf", 2.9, 1.3, 1.4, false],
  ["sod110", 1.9, 0.8, 1, true],
  ["sod123", 3.3, 0.9, 1.2, false],
  ["sod123f", 2.8, 1.1, 1.1, false], // Existing working reference.
  ["sod123fl", 3.146, 0.91, 1.22, true],
  ["sod123w", 2.8, 1.2, 1.2, true],
  ["sod128", 4.4, 1.4, 2.1, true],
  ["sod323f", 2.2, 0.5, 0.5, true],
  ["sod323fl", 2.1, 0.8, 0.9, true],
  ["sod323w", 2.6, 1.2, 1.2, true],
  ["sod723", 0.8, 0.66, 0.5, true],
  ["sod80", 3.75, 1.25, 2, true],
  ["sod882", 0.7, 0.4, 0.7, true],
  ["sod882d", 0.8, 0.5, 0.7, true],
] as const

test.each(packages)(
  "%s preserves its established land pattern across length units",
  async (name, p, pl, pw, showCourtyards) => {
    for (const [unit, millimetersPerUnit] of [
      ["mil", 0.0254],
      ["in", 25.4],
      ["mm", 1],
      ["", 1],
    ] as const) {
      const pitchValue = `${p / millimetersPerUnit}${unit}`
      const pitch = ["sod323f", "sod323fl", "sod323w"].includes(name)
        ? { pad_spacing: pitchValue }
        : { p: pitchValue }
      const circuitJson = footprints[name]({
        fn: name,
        ...pitch,
        pl: `${pl / millimetersPerUnit}${unit}`,
        pw: `${pw / millimetersPerUnit}${unit}`,
      }).circuitJson
      const pads = circuitJson.filter(
        (element) => element.type === "pcb_smtpad",
      )

      expect(pads).toHaveLength(2)
      for (const [index, pad] of pads.entries()) {
        expect(pad.x).toBeCloseTo(index === 0 ? -p / 2 : p / 2, 10)
        expect(pad.y).toBe(0)
        expect(pad.width).toBeCloseTo(pl, 10)
        expect(pad.height).toBeCloseTo(pw, 10)
        expect(pad.port_hints).toEqual([String(index + 1)])
      }

      if (unit === "mil") {
        await expect(
          convertCircuitJsonToPcbSvg(circuitJson, { showCourtyards }),
        ).toMatchSvgSnapshot(import.meta.path, name)
      }
    }
  },
)

test("sod123w strings preserve the default land pattern when expressed in mils", async () => {
  const mil = (millimeters: number) => `${millimeters / 0.0254}mil`
  const circuitJson = fp
    .string(`sod123w_p${mil(2.8)}_pl${mil(1.2)}_pw${mil(1.2)}_cathodepin1`)
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(2)
  expect(pads[0]?.x).toBeCloseTo(-1.4, 10)
  expect(pads[1]?.x).toBeCloseTo(1.4, 10)
  for (const pad of pads) {
    expect(pad.width).toBeCloseTo(1.2, 10)
    expect(pad.height).toBeCloseTo(1.2, 10)
  }
  await expect(
    convertCircuitJsonToPcbSvg(circuitJson, { showFabricationNotes: true }),
  ).toMatchSvgSnapshot(import.meta.path, "sod123w-mil-default-dimensions")
})
