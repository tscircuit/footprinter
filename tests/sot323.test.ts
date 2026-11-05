import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { sot323 } from "../src/fn/sot323"
import { fp } from "../src/footprinter"

test("sot323", () => {
  const circuitJson = fp.string("sot323").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot323")
})

test("sot323_pl1.2_pw0.9_p2_w5.2_h5", () => {
  const circuitJson = fp.string("sot323_pl1.2_pw0.9_p2_w5.2_h5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "sot323_pl1.2_pw0.9_p2_w5.2_h5",
  )
})

test("sot323_3 string and explicit pin counts", () => {
  const circuitJson = fp.string("sot323_3").circuitJson()
  const pads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  expect(pads).toHaveLength(3)
  expect(() => fp.string("sot323_5").circuitJson()).toThrow(
    "Invalid number of pins",
  )
  expect(() => sot323({ fn: "sot323", num_pins: 5 })).toThrow(
    "Invalid number of pins",
  )
})
