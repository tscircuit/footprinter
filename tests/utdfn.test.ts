import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import type { AnyCircuitElement } from "circuit-json"

test("utdfn_4_ep", () => {
  const circuitJson = fp
    .string("utdfn_4_ep")
    .circuitJson() as AnyCircuitElement[]
  const json = fp.string("utdfn_4_ep").json() as any

  expect(json.num_pins).toBe(4)
  expect(json.ep).toBe(true)

  const pads = circuitJson.filter((el) => el.type === "pcb_smtpad")
  expect(pads.length).toBe(5)

  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "utdfn_4_ep")
})

test("UTDFN-4-EP(1x1) (alias)", () => {
  const aliasJson = fp.string("UTDFN-4-EP(1x1)").circuitJson()
  const canonicalJson = fp.string("utdfn_4_ep").circuitJson()
  expect(aliasJson).toEqual(canonicalJson)

  const json = fp.string("UTDFN-4-EP(1x1)").json() as any
  expect(json.num_pins).toBe(4)
  expect(json.ep).toBe(true)
})

test("UTDFN-4-EP (alias)", () => {
  const aliasJson = fp.string("UTDFN-4-EP").circuitJson()
  const canonicalJson = fp.string("utdfn_4_ep").circuitJson()
  expect(aliasJson).toEqual(canonicalJson)
})

test("utdfn signal pads do not overlap the exposed pad", () => {
  const circuitJson = fp
    .string("utdfn_4_ep")
    .circuitJson() as AnyCircuitElement[]
  const ep = circuitJson.find(
    (el: any) => el.type === "pcb_smtpad" && el.port_hints?.includes("5"),
  ) as any
  const signalPads = circuitJson.filter(
    (el: any) => el.type === "pcb_smtpad" && !el.port_hints?.includes("5"),
  ) as any[]

  const epHalfW = ep.width / 2
  const epHalfH = ep.height / 2
  for (const pad of signalPads) {
    // every polygon vertex must lie outside the exposed pad rectangle
    for (const point of pad.points) {
      const inside = Math.abs(point.x) < epHalfW && Math.abs(point.y) < epHalfH
      expect(inside).toBe(false)
    }
  }
})
