import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import {
  sod110,
  sod123,
  sod123fl,
  sod123w,
  sod128,
  sod323f,
  sod323fl,
  sod323w,
  sod723,
  sod80,
  sod882,
  sod882d,
} from "../src/fn"

const variants = [
  ["sod110", sod110, "p"],
  ["sod123", sod123, "p"],
  ["sod123fl", sod123fl, "p"],
  ["sod123w", sod123w, "p"],
  ["sod128", sod128, "p"],
  ["sod323f", sod323f, "pad_spacing"],
  ["sod323fl", sod323fl, "pad_spacing"],
  ["sod323w", sod323w, "pad_spacing"],
  ["sod723", sod723, "p"],
  ["sod80", sod80, "p"],
  ["sod882", sod882, "p"],
  ["sod882d", sod882d, "p"],
] as const

for (const [name, generate, pitchParameter] of variants) {
  test(`${name} converts inch pad dimensions and pitch to millimeters`, () => {
    const { circuitJson } = generate({
      fn: name,
      pl: "0.02in",
      pw: "0.01in",
      [pitchParameter]: "0.1in",
    })
    const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

    expect(pads).toMatchObject([
      {
        port_hints: ["1"],
        x: -1.27,
        y: 0,
        width: 0.508,
        height: 0.254,
      },
      {
        port_hints: ["2"],
        x: 1.27,
        y: 0,
        width: 0.508,
        height: 0.254,
      },
    ])
    expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
      import.meta.path,
      `${name}-inch-dimensions`,
    )
  })
}

test("SOD string definitions preserve physical dimensions expressed in mils", () => {
  const circuitJson = fp.string("sod123_pl20mil_pw10mil_p100mil").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toMatchObject([
    { x: -1.27, width: 0.508, height: 0.254 },
    { x: 1.27, width: 0.508, height: 0.254 },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sod123-inch-dimensions",
  )
})
