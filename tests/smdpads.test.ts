import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("smdpads3 reproduces C78322", () => {
  const circuitJson = fp
    .string(
      "smdpads3_p3.299968mm_pw1.7999964mm_ph5.7999884mm_centerpadwidth2.3999952mm_rounded0",
    )
    .circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toMatchObject([
    {
      port_hints: ["1"],
      x: -3.299968,
      width: 1.7999964,
      height: 5.7999884,
    },
    {
      port_hints: ["2"],
      x: 0,
      width: 2.3999952,
      height: 5.7999884,
    },
    {
      port_hints: ["3"],
      x: 3.299968,
      width: 1.7999964,
      height: 5.7999884,
    },
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "smdpads3_c78322",
  )
})

test("smdpads3 reproduces C7464756", () => {
  const pads = fp
    .string(
      "smdpads3_p1.299972mm_pw0.3999992mm_ph3.0999938mm_centerpadwidth1.1999976mm_rounded0",
    )
    .circuitJson()
    .filter((element) => element.type === "pcb_smtpad")

  expect(pads).toMatchObject([
    {
      port_hints: ["1"],
      x: -1.299972,
      width: 0.3999992,
      height: 3.0999938,
    },
    {
      port_hints: ["2"],
      x: 0,
      width: 1.1999976,
      height: 3.0999938,
    },
    {
      port_hints: ["3"],
      x: 1.299972,
      width: 0.3999992,
      height: 3.0999938,
    },
  ])
})

test("smdpads requires an odd pad count for a center pad width", () => {
  expect(() => fp.string("smdpads4_centerpadwidth2mm").circuitJson()).toThrow(
    "requires an odd number of SMD pads",
  )
})

test("smdpads2 uses body dimensions for its courtyard", () => {
  const footprintString =
    "smdpads2_p4.6599mm_pw2.91mm_ph2.9106mm_w8.128mm_h3.556mm"
  const circuitJson = fp.string(footprintString).circuitJson()
  const courtyard = circuitJson.find(
    (element) => element.type === "pcb_courtyard_rect",
  )

  expect(courtyard).toMatchObject({
    width: 8.628,
    height: 4.056,
  })
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    footprintString,
  )
})
