import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("spdip8 resolves with 8 pins and SPDIP defaults", () => {
  const params = fp.string("spdip8").json()
  expect(params.fn).toBe("spdip")
  expect(params.num_pins).toBe(8)
  expect(params.p).toBe(1.778)
  expect(params.w).toBe(7.62)
})

test("SPDIP-8 (uppercase with hyphen) resolves correctly", () => {
  const params = fp.string("SPDIP-8").json()
  expect(params.fn).toBe("spdip")
  expect(params.num_pins).toBe(8)
})

test("Spdip8 (mixed case) resolves correctly", () => {
  const params = fp.string("Spdip8").json()
  expect(params.fn).toBe("spdip")
  expect(params.num_pins).toBe(8)
})

test("spdip28 resolves with 28 pins", () => {
  const params = fp.string("spdip28").json()
  expect(params.fn).toBe("spdip")
  expect(params.num_pins).toBe(28)
  expect(params.p).toBe(1.778)
})

test("spdip8_p1.5mm respects custom pitch", () => {
  const params = fp.string("spdip8_p1.5mm").json()
  expect(params.p).toBe(1.5)
})

test("spdip8_w300mil respects custom width", () => {
  const params = fp.string("spdip8_w300mil").json()
  expect(params.w).toBeCloseTo(7.62, 2)
})

test("spdip8 svg snapshot", () => {
  const circuitJson = fp
    .string("spdip8")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip8")
})

test("spdip4 svg snapshot", () => {
  const circuitJson = fp
    .string("spdip4")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip4")
})

test("spdip28 svg snapshot", () => {
  const circuitJson = fp
    .string("spdip28")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})
