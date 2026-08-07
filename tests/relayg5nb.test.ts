import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("relayg5nb matches C225714", () => {
  const circuitJson = fp.string("relayg5nb").circuitJson()
  const pads = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )

  expect(pads).toHaveLength(4)
  expect(
    pads.map(({ x, y, hole_diameter, outer_diameter }) => [
      x,
      y,
      hole_diameter,
      outer_diameter,
    ]),
  ).toEqual([
    [-9.3, -2.3, 1.1, 1.8],
    [2.2, -2.3, 1.3, 2],
    [9.2, -2.3, 1.3, 2],
    [-9.3, 2.4, 1.1, 1.8],
  ])

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "relayg5nb_c225714",
  )
})
