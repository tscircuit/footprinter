import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

type RectangularPad = {
  height: number
  port_hints?: string[]
  width: number
  x: number
  y: number
}

test("fpc12 reproduces the FPC-05F-12PH20 copper pattern", () => {
  const circuitJson = fp
    .string(
      "fpc12_p0.5mm_pw0.3mm_pl1.25mm_mpx8.88mm_mpy2.575mm_mpw2mm_mpl2.5mm",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad",
  ) as RectangularPad[]

  expect(pads).toHaveLength(14)
  expect(
    pads.map(({ x, y, width, height, port_hints }) => ({
      x,
      y,
      width,
      height,
      port_hints,
    })),
  ).toEqual([
    { x: -2.75, y: 0, width: 0.3, height: 1.25, port_hints: ["1"] },
    { x: -2.25, y: 0, width: 0.3, height: 1.25, port_hints: ["2"] },
    { x: -1.75, y: 0, width: 0.3, height: 1.25, port_hints: ["3"] },
    { x: -1.25, y: 0, width: 0.3, height: 1.25, port_hints: ["4"] },
    { x: -0.75, y: 0, width: 0.3, height: 1.25, port_hints: ["5"] },
    { x: -0.25, y: 0, width: 0.3, height: 1.25, port_hints: ["6"] },
    { x: 0.25, y: 0, width: 0.3, height: 1.25, port_hints: ["7"] },
    { x: 0.75, y: 0, width: 0.3, height: 1.25, port_hints: ["8"] },
    { x: 1.25, y: 0, width: 0.3, height: 1.25, port_hints: ["9"] },
    { x: 1.75, y: 0, width: 0.3, height: 1.25, port_hints: ["10"] },
    { x: 2.25, y: 0, width: 0.3, height: 1.25, port_hints: ["11"] },
    { x: 2.75, y: 0, width: 0.3, height: 1.25, port_hints: ["12"] },
    { x: 4.44, y: -2.575, width: 2, height: 2.5, port_hints: ["13"] },
    { x: -4.44, y: -2.575, width: 2, height: 2.5, port_hints: ["14"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "fpc12_FPC-05F-12PH20",
  )
})

test("fpc30_staggered reproduces the AFC11-S30ICA-00 copper pattern", () => {
  const circuitJson = fp
    .string(
      "fpc30_staggered_p0.5mm_py2.4mm_pw0.4mm_pl1.4mm_mpx18mm_mpy0mm_mpw2mm_mpl2.4mm",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad",
  ) as RectangularPad[]

  expect(pads).toHaveLength(32)
  expect(
    [pads[0]!, pads[1]!, pads[28]!, pads[29]!, pads[30]!, pads[31]!].map(
      ({ x, y, width, height, port_hints }) => ({
        x,
        y,
        width,
        height,
        port_hints,
      }),
    ),
  ).toEqual([
    { x: -7.25, y: -1.2, width: 0.4, height: 1.4, port_hints: ["1"] },
    { x: -6.75, y: 1.2, width: 0.4, height: 1.4, port_hints: ["2"] },
    { x: 6.75, y: -1.2, width: 0.4, height: 1.4, port_hints: ["29"] },
    { x: 7.25, y: 1.2, width: 0.4, height: 1.4, port_hints: ["30"] },
    { x: 9, y: 0, width: 2, height: 2.4, port_hints: ["31"] },
    { x: -9, y: 0, width: 2, height: 2.4, port_hints: ["32"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "fpc30_staggered_AFC11-S30ICA-00",
  )
})

test("fpc31_staggered supports unequal row lengths for FPC-0.3HF-31PWBH10", () => {
  const circuitJson = fp
    .string(
      "fpc31_staggered_p0.3mm_py3.065mm_pw0.3mm_pl0.67mm_toppl0.5mm_bottompl0.67mm_mpx10.95mm_mpy1.279mm_mpw0.35mm_mpl1mm",
    )
    .circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_smtpad",
  ) as RectangularPad[]

  expect(pads).toHaveLength(33)
  expect(
    [pads[0]!, pads[1]!, pads[30]!, pads[31]!, pads[32]!].map(
      ({ x, y, width, height, port_hints }) => ({
        x,
        y,
        width,
        height,
        port_hints,
      }),
    ),
  ).toEqual([
    { x: -4.5, y: -1.5325, width: 0.3, height: 0.67, port_hints: ["1"] },
    { x: -4.2, y: 1.5325, width: 0.3, height: 0.5, port_hints: ["2"] },
    { x: 4.5, y: -1.5325, width: 0.3, height: 0.67, port_hints: ["31"] },
    { x: 5.475, y: -1.279, width: 0.35, height: 1, port_hints: ["32"] },
    { x: -5.475, y: -1.279, width: 0.35, height: 1, port_hints: ["33"] },
  ])
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "fpc31_staggered_FPC-0.3HF-31PWBH10",
  )
})
