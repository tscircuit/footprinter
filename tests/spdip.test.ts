import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("spdip28", () => {
  const circuitJson = fp
    .string("spdip28")
    .circuitJson() as AnyCircuitElement[]
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

test("spdip8", () => {
  const circuitJson = fp
    .string("spdip8")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip8")
})

test("spdip default params", () => {
  const json = fp.string("spdip28").json()
  // SPDIP defaults: pitch = 1.778mm (shrink), width = 7.62mm (narrow body)
  expect(json.fn).toBe("spdip")
  expect(json.num_pins).toBe(28)
  expect(json.w).toBe(7.62)
  expect(json.p).toBe(1.778)
})
