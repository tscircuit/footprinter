import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8 matches dip8", () => {
  const pdipJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const dipJson = fp.string("dip8").circuitJson() as AnyCircuitElement[]
  expect(pdipJson).toEqual(dipJson)
})

test("pdip8 parameters", () => {
  const json = fp.string("pdip8").json()
  expect(json).toMatchInlineSnapshot(
    {
      fn: "dip",
      id: 0.8,
      num_pins: 8,
      od: 1.6,
      p: 2.54,
      w: 7.62,
    },
    `
{
  "fn": "dip",
  "id": 0.8,
  "nosquareplating": false,
  "num_pins": 8,
  "od": 1.6,
  "p": 2.54,
  "w": 7.62,
}
`,
  )
})

test("pdip16", () => {
  const circuitJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip16")
})

test("pdip16 matches dip16", () => {
  const pdipJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const dipJson = fp.string("dip16").circuitJson() as AnyCircuitElement[]
  expect(pdipJson).toEqual(dipJson)
})

test("pdip builder API", () => {
  const circuitJson = fp().pdip(8).w(7.62).circuitJson()
  expect(circuitJson.length).toBeGreaterThan(0)
})
