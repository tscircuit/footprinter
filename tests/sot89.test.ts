import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { sot89 } from "../src/fn/sot89"

test("sot89_3 (3 pads)", () => {
  const circuitjson = sot89({ fn: "sot89_3" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot89_3")
})

test("sot89_5 (5 pads)", () => {
  const circuitjson = sot89({ fn: "sot89_5" }).circuitJson
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sot89_5")
})
