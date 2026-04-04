import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("pdip8 generates 8 plated holes", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const platedHoles = circuitJson.filter((el) => el.type === "pcb_plated_hole")
  expect(platedHoles.length).toBe(8)
})

test("pdip8 has standard DIP pitch (2.54mm)", () => {
  const params = fp.string("pdip8").json()
  expect(params.p).toBeCloseTo(2.54, 2)
})

test("PDIP8 case-insensitive", () => {
  const uppercaseJson = fp.string("PDIP8").json()
  const lowercaseJson = fp.string("pdip8").json()
  expect(uppercaseJson).toEqual(lowercaseJson)
})

test("pdip8 svg snapshot", () => {
  const circuitJson = fp.string("pdip8").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "pdip8")
})

test("spdip28 generates 28 plated holes", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const platedHoles = circuitJson.filter((el) => el.type === "pcb_plated_hole")
  expect(platedHoles.length).toBe(28)
})

test("spdip28 has shrink pitch (1.778mm)", () => {
  const params = fp.string("spdip28").json()
  expect(params.p).toBeCloseTo(1.778, 2)
})

test("spdip28 svg snapshot", () => {
  const circuitJson = fp.string("spdip28").circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "spdip28")
})
