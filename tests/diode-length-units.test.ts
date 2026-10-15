import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import * as footprints from "../src/fn"
import { fp } from "../src/footprinter"

const affectedFootprints = [
  "melf",
  "micromelf",
  "minimelf",
  "sma",
  "smb",
  "smc",
  "smf",
  "sod110",
  "sod123",
  "sod123fl",
  "sod123w",
  "sod128",
  "sod323f",
  "sod323fl",
  "sod323w",
  "sod723",
  "sod80",
  "sod882",
  "sod882d",
] as const

const dimensions = [
  { p: "100mil", pl: "20mil", pw: "10mil" },
  { p: "0.1in", pl: "0.02in", pw: "0.01in" },
  { p: "2.54mm", pl: "0.508mm", pw: "0.254mm" },
  { p: "2.54", pl: "0.508", pw: "0.254" },
]

test.each(affectedFootprints)(
  "%s converts pitch and pad dimensions to millimeters",
  async (name) => {
    const generate = (input: (typeof dimensions)[number]) => {
      const pitch = ["sod323f", "sod323fl", "sod323w"].includes(name)
        ? { pad_spacing: input.p }
        : { p: input.p }
      return footprints[name]({
        fn: name,
        ...pitch,
        pl: input.pl,
        pw: input.pw,
      }).circuitJson
    }
    const expected = generate(dimensions[2]!)

    for (const input of dimensions) {
      const circuitJson = generate(input)
      const pads = circuitJson.filter(
        (element) => element.type === "pcb_smtpad",
      )

      expect(pads).toHaveLength(2)
      for (const [index, pad] of pads.entries()) {
        expect(pad.x).toBeCloseTo(index === 0 ? -1.27 : 1.27, 10)
        expect(pad.y).toBe(0)
        expect(pad.width).toBeCloseTo(0.508, 10)
        expect(pad.height).toBeCloseTo(0.254, 10)
        expect(pad.port_hints).toEqual([String(index + 1)])
      }
      expect(circuitJson).toEqual(expected)
    }

    await expect(
      convertCircuitJsonToPcbSvg(generate(dimensions[0]!), {
        showFabricationNotes: true,
      }),
    ).toMatchSvgSnapshot(import.meta.path, `${name}-mil-pad-dimensions`)
  },
)

test.each(["sod123w", "sod123f"])(
  "%s footprint strings support mils for pitch and pad dimensions",
  async (name) => {
    const circuitJson = fp
      .string(`${name}_p100mil_pl20mil_pw10mil`)
      .circuitJson()
    const expected = fp
      .string(`${name}_p2.54mm_pl0.508mm_pw0.254mm`)
      .circuitJson()
    const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

    expect(pads).toHaveLength(2)
    expect(pads[0]).toMatchObject({
      x: -1.27,
      y: 0,
      width: 0.508,
      height: 0.254,
    })
    expect(pads[1]).toMatchObject({
      x: 1.27,
      y: 0,
      width: 0.508,
      height: 0.254,
    })
    expect(circuitJson).toEqual(expected)
    await expect(
      convertCircuitJsonToPcbSvg(circuitJson, {
        showFabricationNotes: true,
      }),
    ).toMatchSvgSnapshot(import.meta.path, `${name}-mil-pad-dimensions`)
  },
)
