import { expect, test } from "bun:test"
import * as footprints from "../src/fn"
import { fp } from "../src/footprinter"

const sotPackages = [
  ["sot", 6, { h: 1.3, p: 0.95, pl: 1.325, pw: 0.6 }],
  ["sot23", 3, { w: 2.275, h: 2.74, p: 0.95, pl: 1.325, pw: 0.6 }],
  ["sot23", 5, { w: 2.275, h: 2.74, p: 0.95, pl: 1.325, pw: 0.6 }],
  ["sot23w", 3, { w: 3.4, h: 3.3, p: 1.2, pl: 1, pw: 0.7 }],
  [
    "sot223",
    4,
    {
      w: 8.5,
      h: 6.9,
      p: 2.3,
      pl: 2,
      pw: 1.5,
      tabpl: 2,
      tabpw: 3.8,
      taboffset: 0,
    },
  ],
  ["sot323", 3, { w: 2.45, h: 2.4, p: 0.891, pl: 0.92, pw: 0.45 }],
  ["sot343", 4, { w: 3.2, h: 2.6, p: 0.55, pl: 1.05, pw: 0.45 }],
  ["sot363", 6, { w: 3.1, h: 2, p: 0.65, pl: 1.03, pw: 0.35 }],
  ["sot457", 6, { w: 2.7, h: 2.5, p: 0.95, pl: 0.8, pw: 0.55 }],
  ["sot563", 6, { w: 2.1, h: 2.45, p: 0.5, pl: 0.675, pw: 0.35 }],
  ["sot723", 3, { w: 1.2, h: 1.2, p: 0.575, pl: 0.45, pw: 0.4 }],
  ["sot89", 3, { w: 4.2, h: 4.8, p: 1.5, pl: 1.3, pw: 0.9 }],
  ["sot963", 6, { w: 1.1, h: 1.45, p: 0.35, pl: 0.2, pw: 0.2 }],
] as const

test.each(sotPackages)(
  "%s (%i-pin) preserves its default land pattern across length units",
  (name, numPins, defaults) => {
    const baseline = (footprints as any)[name]({
      fn: name,
      num_pins: numPins,
      string: `${name}_${numPins}`,
    }).circuitJson
    const baselinePads = baseline.filter(
      (element: any) => element.type === "pcb_smtpad",
    )

    for (const [unit, millimetersPerUnit] of [
      ["mil", 0.0254],
      ["in", 25.4],
      ["mm", 1],
      ["", 1],
    ] as const) {
      const convertedParams: Record<string, unknown> = {
        fn: name,
        num_pins: numPins,
        string: `${name}_${numPins}`,
      }
      for (const [key, value] of Object.entries(defaults)) {
        convertedParams[key] = `${value / millimetersPerUnit}${unit}`
      }

      const circuitJson = (footprints as any)[name](convertedParams).circuitJson
      const pads = circuitJson.filter(
        (element: any) => element.type === "pcb_smtpad",
      )

      expect(pads).toHaveLength(baselinePads.length)
      for (const [index, pad] of pads.entries()) {
        const expectedPad = baselinePads[index]!
        expect(pad.shape).toBe(expectedPad.shape)
        if ("x" in expectedPad && "x" in pad) {
          expect(pad.x).toBeCloseTo(expectedPad.x, 8)
          expect(pad.y).toBeCloseTo(expectedPad.y, 8)
        }
        if ("width" in expectedPad && "width" in pad) {
          expect(pad.width).toBeCloseTo(expectedPad.width, 8)
          expect(pad.height).toBeCloseTo(expectedPad.height, 8)
        }
        expect(pad.port_hints).toEqual(expectedPad.port_hints)
      }
    }
  },
)

test("SOT footprint strings parse explicit pin counts and mil dimensions", () => {
  const mil = (millimeters: number) => `${millimeters / 0.0254}mil`

  const sot23Pads = fp
    .string(
      `sot23_3_w${mil(2.275)}_p${mil(0.95)}_pl${mil(1.325)}_pw${mil(0.6)}`,
    )
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")
  expect(sot23Pads).toHaveLength(3)
  expect(sot23Pads[0]).toMatchObject({
    width: expect.closeTo(1.325, 8),
    height: expect.closeTo(0.6, 8),
  })

  expect(
    fp
      .string(`sot23w_3_p${mil(1.2)}_pl${mil(1)}_pw${mil(0.7)}`)
      .circuitJson()
      .filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(3)

  expect(
    fp
      .string(`sot323_3_p${mil(0.891)}_pl${mil(0.92)}_pw${mil(0.45)}`)
      .circuitJson()
      .filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(3)

  expect(
    fp
      .string(`sot343_4_p${mil(0.55)}_pl${mil(1.05)}_pw${mil(0.45)}`)
      .circuitJson()
      .filter((element) => element.type === "pcb_smtpad"),
  ).toHaveLength(4)
})
