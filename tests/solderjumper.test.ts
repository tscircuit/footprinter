import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { solderjumper } from "../src/fn/solderjumper"
import { fp } from "src"

test("solderjumper 2-pin no bridge", () => {
  const circuitJson = solderjumper({ num_pins: 2 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2")
})

test("solderjumper 3-pin no bridge", () => {
  const circuitJson = solderjumper({ num_pins: 3 }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper3")
})

test("solderjumper 2-pin custom pitch", () => {
  const circuitJson = solderjumper({
    num_pins: 2,
    p: 6,
  }).circuitJson
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2_p6")
})

test("solderjumper 2-pin custom pad size", () => {
  const circuitJson = fp.string("solderjumper2_pw1_ph1.5").circuitJson()
  const svg = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svg).toMatchSvgSnapshot(import.meta.path, "solderjumper2_pw1_ph1.5")
})
