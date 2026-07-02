import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("utdfn4 resolves with 4 pins", () => {
  const params = fp.string("utdfn4").json()
  expect(params.fn).toBe("utdfn")
  expect(params.num_pins).toBe(4)
})

test("utdfn4_ep1x1 enables exposed pad with 1x1mm", () => {
  const params = fp.string("utdfn4_ep1x1").json()
  expect(params.fn).toBe("utdfn")
  expect(params.num_pins).toBe(4)
  expect(params.ep).toBe(true)
  expect(params.epw).toBe(1)
  expect(params.eph).toBe(1)
})

test("utdfn4 svg snapshot", () => {
  const circuitJson = fp
    .string("utdfn4")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4")
})

test("utdfn4_ep1x1 svg snapshot", () => {
  const circuitJson = fp
    .string("utdfn4_ep1x1")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4_ep1x1")
})
