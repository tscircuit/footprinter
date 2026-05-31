import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("utdfn4", () => {
  const circuitJson = fp.string("utdfn4").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4")
})

test("utdfn4 default parameters", () => {
  const json = fp.string("utdfn4").json()
  expect(json).toMatchInlineSnapshot(
    {
      fn: "utdfn",
      num_pins: 4,
      w: "1mm",
      h: "1mm",
      p: "0.65mm",
      pl: "0.35mm",
      pw: "0.25mm",
      epw: "0.5mm",
      eph: "0.5mm",
    },
    `
{
  "eph": "0.5mm",
  "epw": "0.5mm",
  "fn": "utdfn",
  "h": "1mm",
  "num_pins": 4,
  "p": "0.65mm",
  "pl": "0.35mm",
  "pw": "0.25mm",
  "string": "utdfn4",
  "w": "1mm",
}
`,
  )
})

