import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const json = fp.string("pdip8").json()

  expect(json).toMatchInlineSnapshot(
    {
      fn: "pdip",
      id: 0.8,
      num_pins: 8,
      od: 1.6,
      p: 2.54,
      w: 7.62,
    },
    `
{
  "fn": "pdip",
  "id": 0.8,
  "nosquareplating": false,
  "num_pins": 8,
  "od": 1.6,
  "p": 2.54,
  "w": 7.62,
}
`,
  )

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("PDIP-8 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(fp.string("PDIP-8").circuitJson())
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("pdip8").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("PDIP-8 matches DIP-8 geometry", () => {
  const pdipJson = fp.string("pdip8").circuitJson()
  const dipJson = fp.string("dip8").circuitJson()
  expect(pdipJson).toEqual(dipJson)
})
