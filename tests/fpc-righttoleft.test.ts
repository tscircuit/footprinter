import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { c202112PinPositions } from "./fixtures/c202112-pin-positions"

test("fpc24_righttoleft matches every C202112 contact and mounting pin", () => {
  const circuitJson = fp
    .string(
      "fpc24_righttoleft_mounttop_p0.5mm_pw0.28mm_pl1.4mm_mpx15.59mm_mpy3.18mm_mpw1.6mm_mpl2.3mm",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad" && element.shape === "rect",
  )

  expect(pads).toHaveLength(c202112PinPositions.length)
  for (const expected of c202112PinPositions) {
    const actual = pads.find((pad) =>
      pad.port_hints?.includes(String(expected.pin)),
    )!
    expect(actual).toBeDefined()
    expect(Math.abs(actual.x - expected.x)).toBeLessThan(0.006)
    expect(Math.abs(actual.y - expected.y)).toBeLessThan(0.006)
  }
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "fpc24_righttoleft_C202112",
  )
})

for (const righttoleft of [false, true]) {
  test(`fpc_staggered_reverse preserves the upper first row with righttoleft=${righttoleft}`, () => {
    const circuitJson = fp()
      .fpc(6)
      .staggered()
      .reverse()
      .righttoleft(righttoleft)
      .toppl("0.5mm")
      .bottompl("1mm")
      .circuitJson()
    const pads = circuitJson.filter(
      (element) => element.type === "pcb_smtpad" && element.shape === "rect",
    )
    expect(
      pads.map(({ x, y, height, port_hints }) => ({
        x,
        y,
        height,
        port_hints,
      })),
    ).toEqual([
      { x: righttoleft ? 1.25 : -1.25, y: 1.2, height: 0.5, port_hints: ["1"] },
      { x: righttoleft ? 0.75 : -0.75, y: -1.2, height: 1, port_hints: ["2"] },
      { x: righttoleft ? 0.25 : -0.25, y: 1.2, height: 0.5, port_hints: ["3"] },
      { x: righttoleft ? -0.25 : 0.25, y: -1.2, height: 1, port_hints: ["4"] },
      { x: righttoleft ? -0.75 : 0.75, y: 1.2, height: 0.5, port_hints: ["5"] },
      { x: righttoleft ? -1.25 : 1.25, y: -1.2, height: 1, port_hints: ["6"] },
      { x: 3, y: 0, height: 2.5, port_hints: ["7"] },
      { x: -3, y: 0, height: 2.5, port_hints: ["8"] },
    ])
    expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
      import.meta.path,
      righttoleft
        ? "fpc6_staggered_reverse_righttoleft"
        : "fpc6_staggered_reverse",
    )
  })
}
