import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("dip footprint", () => {
  const circuitJson = fp().dip(4).w(4).p(2).circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip footprint")
})

test("dip16", () => {
  const circuitJson = fp.string("dip16").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip16")
})

test("dip4_w3.00mm", () => {
  const circuitJson = fp
    .string("dip4_w3.00mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip4_w3.00mm")
})
test("dip10_w4.00mm_p2.65mm", () => {
  const circuitJson = fp
    .string("dip10_w4.00mm_p2.65mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dip10_w4.00mm_p2.65mm",
  )
})

test("dip4", () => {
  const circuitJson = fp.string("dip4").circuitJson() as AnyCircuitElement[]
  const json = fp.string("dip4").json()

  expect(json).toMatchInlineSnapshot(`
    {
      "fn": "dip",
      "id": 1,
      "num_pins": 4,
      "od": 1.5,
      "p": 2.54,
      "w": 7.62,
    }
  `)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip4")
})

test("dip8_p1.27mm", () => {
  const circuitJson = fp.string("dip8_p1.27mm").circuitJson()
  let svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip8_p1.27mm")
})

test("dip14_w7.62mm_p2.54mm", () => {
  const circuitJson = fp
    .string("dip14_w7.62mm_p2.54mm")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "dip14_w7.62mm_p2.54mm",
  )
})

test("dip_0.1in", () => {
  const circuitJson = fp
    .string("dip_0.1in")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "dip_0.1in")
})
