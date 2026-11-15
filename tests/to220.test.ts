import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "src/footprinter"

test("to220_2 (2 holes)", () => {
  const circuitjson = fp.string("to220_2").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_2")
})

test("to220_3 (3 holes)", () => {
  const circuitjson = fp.string("to220_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_3")
})
test("to220_4 (4 holes)", () => {
  const circuitjson = fp.string("to220_4").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitjson)

  expect(circuitjson).toBeDefined()
  expect(circuitjson.length).toBeGreaterThan(0)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_4")
})

test("to220_5 (5 holes)", () => {
  const circuitJson = fp.string("to220_5").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220_5")
})

test("to220f_3", () => {
  const circuitJson = fp.string("to220f_3").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(circuitJson)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "to220f_3")
})

test("TO-220F-3 (alias)", () => {
  const aliasSvg = convertCircuitJsonToPcbSvg(
    fp.string("TO-220F-3").circuitJson(),
  )
  const canonicalSvg = convertCircuitJsonToPcbSvg(
    fp.string("to220f_3").circuitJson(),
  )
  expect(aliasSvg).toEqual(canonicalSvg)
})

test("to220 default pin pitches (#790)", () => {
  const holes2 = fp
    .string("to220_2")
    .circuitJson()
    .filter((el) => el.type === "pcb_plated_hole")
  expect(holes2).toHaveLength(2)
  expect(holes2[1]!.x - holes2[0]!.x).toBeCloseTo(5.08, 5)

  const holes3 = fp
    .string("to220_3")
    .circuitJson()
    .filter((el) => el.type === "pcb_plated_hole")
  expect(holes3).toHaveLength(3)
  expect(holes3[1]!.x - holes3[0]!.x).toBeCloseTo(2.54, 5)
  expect(holes3[2]!.x - holes3[1]!.x).toBeCloseTo(2.54, 5)
})
