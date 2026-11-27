import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("toll8 matches C2979263", () => {
  const circuitJson = fp.string("toll8").circuitJson()
  const pads = circuitJson.filter((element) => element.type === "pcb_smtpad")
  const drainPad = pads.find((pad) => pad.port_hints.includes("9"))
  const bridgePad = pads.find((pad) => pad.port_hints.includes("10"))

  expect(pads).toHaveLength(10)
  expect(drainPad).toMatchObject({ x: 0, y: 2.075, width: 10, height: 8.5 })
  expect(bridgePad).toMatchObject({
    x: 0.64,
    y: -4.525,
    width: 8.08,
    height: 0.8,
  })

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "toll8_c2979263",
  )
})
