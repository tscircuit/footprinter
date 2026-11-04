import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("fuseclip matches C3130", () => {
  const circuitJson = fp.string("fuseclip").circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(pads).toHaveLength(2)
  expect(pads.every((pad) => pad.shape === "pill")).toBe(true)
  expect(pads).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ x: -2.575052, ccw_rotation: 90 }),
      expect.objectContaining({ x: 2.575052, ccw_rotation: 90 }),
    ]),
  )

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "fuseclip_c3130",
  )
})
