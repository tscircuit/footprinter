import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("utdfn4", () => {
  const circuitJson = fp
    .string("utdfn4")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4")
})

test("UTDFN-4-EP(1x1) alias", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("UTDFN-4-EP(1x1)").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("utdfn4").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("utdfn4 default params", () => {
  const json = fp.string("utdfn4").json()
  // UTDFN-4-EP(1x1) defaults: w=1.0mm, p=0.5mm
  // Note: h is computed from pin layout, not passed as param
  expect(json.fn).toBe("utdfn")
  expect(json.num_pins).toBe(4)
  expect(json.w).toBe(1)
  expect(json.p).toBe(0.5)
})
