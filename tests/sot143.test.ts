import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sot143 matches C2827688", () => {
  const circuitJson = fp.string("sot143").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")

  expect(pads).toHaveLength(4)
  expect(pads[0]).toMatchObject({
    x: -0.750062,
    y: -1.191387,
    width: 1.1938,
    height: 0.8382,
  })
  expect(pads.slice(1).every((pad) => pad.width === 0.8382)).toBe(true)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "sot143_c2827688",
  )
})
