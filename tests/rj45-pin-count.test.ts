import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const platedHoleCount = (definition: string) =>
  fp
    .string(definition)
    .circuitJson()
    .filter((element) => element.type === "pcb_plated_hole").length

test("rj45_14 selects the fourteen-position variant like every other _N footprint", () => {
  const circuitJson = fp.string("rj45_14").circuitJson()
  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  expect(platedHoles).toHaveLength(14)
  expect(platedHoles.slice(-2).map(({ port_hints }) => port_hints)).toEqual([
    ["14"],
    ["13"],
  ])
  expect(platedHoleCount("rj45_10")).toBe(10)
  expect(platedHoleCount("rj45_ledpins")).toBe(14)

  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "rj45_14",
  )
})

test("rj45 rejects unsupported pin counts instead of silently drawing ten pins", () => {
  expect(() => fp.string("rj45_12").circuitJson()).toThrow()
  expect(() => fp.string("rj45_16").circuitJson()).toThrow()
  expect(() => fp().rj45(12).circuitJson()).toThrow()
})
