import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { sot23w } from "../src/fn/sot23w"
import { fp } from "../src/footprinter"

test("sot23w", () => {
  const circuitJson = fp.string("sot23w").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23w")
})

test("sot23w", () => {
  const circuitJson = fp.string("sot23w_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot23w_pl1.2_pw0.9_p2_w5.2_h5",
  )
})
test("sot23w", () => {
  const circuitJson = fp.string("sot23w_p2_w5.1_h5.2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot23w_p2_w5.1_h5.2")
})

test("sot23w_3 string and explicit pin counts", () => {
  const circuitJson = fp.string("sot23w_3").circuitJson()
  const pads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  expect(() => fp.string("sot23w_5").circuitJson()).toThrow(
    "Invalid number of pins",
  )
  expect(() => sot23w({ fn: "sot23w", num_pins: 5 })).toThrow(
    "Invalid number of pins",
  )
})
