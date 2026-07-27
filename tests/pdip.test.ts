import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip8 uses oblong pads unlike dip8 circular pads", () => {
  const pdipJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const dipJson = fp.string("dip8").circuitJson() as AnyCircuitElement[]

  // PDIP should use pill-shaped pads for non-pin-1 holes
  const pdipHoles = pdipJson.filter(
    (e) => e.type === "pcb_plated_hole" && e.shape === "pill",
  )
  const dipHoles = dipJson.filter(
    (e) => e.type === "pcb_plated_hole" && e.shape === "circle",
  )

  // PDIP has pill pads, DIP has circle pads (for non-pin-1)
  expect(pdipHoles.length).toBe(7)
  expect(dipHoles.length).toBe(7)

  // PDIP and DIP should NOT produce identical output
  expect(pdipJson).not.toEqual(dipJson)
})

test("pdip8 parameters", () => {
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
})

test("pdip16", () => {
  const circuitJson = fp.string("pdip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip16")
})

test("pdip builder API", () => {
  const circuitJson = fp().pdip(8).w(7.62).circuitJson()
  expect(circuitJson.length).toBeGreaterThan(0)
})
