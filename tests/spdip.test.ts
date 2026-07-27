import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("spdip28", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const json = fp.string("spdip28").json()

  expect(json).toMatchInlineSnapshot(
    {
      fn: "spdip",
      id: 0.8,
      num_pins: 28,
      od: 1.6,
      p: 2.54,
      w: 7.62,
    },
    `
{
  "fn": "spdip",
  "id": 0.8,
  "nosquareplating": false,
  "num_pins": 28,
  "od": 1.6,
  "p": 2.54,
  "w": 7.62,
}
`,
  )

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})

test("SPDIP-28 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("SPDIP-28").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("spdip28").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("SPDIP-28 matches DIP-28_W7.62mm geometry", () => {
  const spdipJson = fp.string("spdip28").circuitJson()
  const dipJson = fp.string("dip28_w7.62mm").circuitJson()
  expect(spdipJson).toEqual(dipJson)
})
