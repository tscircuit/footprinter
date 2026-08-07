import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("led3510 matches C22461789", () => {
  const circuitJson = fp.string("led3510").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(
    pads.map(({ port_hints, x, width }) => [port_hints[0], x, width]),
  ).toEqual([
    ["4", -1.4, 0.6],
    ["3", -0.51, 0.44],
    ["2", 0.39, 0.44],
    ["1", 1.4, 0.6],
  ])
  expect(pads.every((pad) => pad.height === 0.8)).toBe(true)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "led3510_c22461789",
  )
})
