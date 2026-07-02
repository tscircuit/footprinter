import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8 resolves as dip with 8 pins", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const params = fp.string("pdip8").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
  expect(params.p).toBe(2.54)
  expect(params.w).toBe(7.62)
})

test("PDIP-8 (uppercase with hyphen) resolves correctly", () => {
  const params = fp.string("PDIP-8").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
})

test("Pdip8 (mixed case) resolves correctly", () => {
  const params = fp.string("Pdip8").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
})

test("spdip8 resolves as dip with 8 pins", () => {
  const circuitJson = fp.string("spdip8").circuitJson() as AnyCircuitElement[]
  const params = fp.string("spdip8").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
})

test("SPDIP-8 (uppercase with hyphen) resolves correctly", () => {
  const params = fp.string("SPDIP-8").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
})

test("pdip8 json matches dip8 json", () => {
  const pdipJson = fp.string("pdip8").json()
  const dipJson = fp.string("dip8").json()
  expect(pdipJson).toEqual(dipJson)
})

test("spdip8 json matches dip8 json", () => {
  const spdipJson = fp.string("spdip8").json()
  const dipJson = fp.string("dip8").json()
  expect(spdipJson).toEqual(dipJson)
})

test("pdip8_w300mil respects width parameter", () => {
  const params = fp.string("pdip8_w300mil").json()
  expect(params.fn).toBe("dip")
  expect(params.num_pins).toBe(8)
  expect(params.w).toBeCloseTo(7.62, 2)
})

test("pdip8 svg snapshot matches dip8", () => {
  const pdipSvg = convertCircuitJsonToPcbSvg(
    fp.string("pdip8").circuitJson() as AnyCircuitElement[],
  )
  const dipSvg = convertCircuitJsonToPcbSvg(
    fp.string("dip8").circuitJson() as AnyCircuitElement[],
  )
  expect(pdipSvg).toEqual(dipSvg)
})

test("pdip8 svg snapshot", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("pdip4_w3.00mm svg snapshot matches dip4_w3.00mm", () => {
  const pdipSvg = convertCircuitJsonToPcbSvg(
    fp.string("pdip4_w3.00mm").circuitJson() as AnyCircuitElement[],
  )
  const dipSvg = convertCircuitJsonToPcbSvg(
    fp.string("dip4_w3.00mm").circuitJson() as AnyCircuitElement[],
  )
  expect(pdipSvg).toEqual(dipSvg)
})

test("spdip8 svg snapshot", () => {
  const circuitJson = fp
    .string("spdip8")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip8")
})
