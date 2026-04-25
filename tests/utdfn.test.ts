import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("utdfn4ep1x1 string resolves", () => {
  const circuitJson = fp
    .string("utdfn4ep1x1")
    .circuitJson() as AnyCircuitElement[]
  expect(circuitJson.length).toBeGreaterThan(0)
})

test("utdfn4ep1x1", () => {
  const circuitJson = fp
    .string("utdfn4ep1x1")
    .circuitJson() as AnyCircuitElement[]
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn4ep1x1")
})

test("utdfn4ep1x1 has 4 signal pads plus exposed pad", () => {
  const circuitJson = fp
    .string("utdfn4ep1x1")
    .circuitJson() as AnyCircuitElement[]
  const smtPads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  // 4 signal pads + 1 exposed pad
  expect(smtPads.length).toBe(5)
})

test("utdfn4ep1x1 json parameters", () => {
  const json = fp.string("utdfn4ep1x1").json()
  expect(json).toMatchObject({
    fn: "utdfn",
    num_pins: 4,
    w: 1,
    h: 1,
    p: 0.5,
  })
})

test("UTDFN-4-EP(1x1) normalized string resolves same as utdfn4ep1x1", () => {
  const normalizedJson = fp.string("UTDFN-4-EP(1x1)").json()
  const directJson = fp.string("utdfn4ep1x1").json()
  expect(normalizedJson).toEqual(directJson)
})
