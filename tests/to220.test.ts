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

test("to220 uses the fixed JEDEC 2.54mm pitch regardless of body width", () => {
  const circuitjson = fp.string("to220").circuitJson()
  const holes = circuitjson.filter(
    (el: any) => el.type === "pcb_plated_hole",
  ) as any[]
  const xs = holes.map((h) => h.x).sort((a, b) => a - b)
  expect(xs).toEqual([-2.54, 0, 2.54])

  // a wider body must not change the pitch
  const wide = fp.string("to220").w(20).circuitJson()
  const wideXs = wide
    .filter((el: any) => el.type === "pcb_plated_hole")
    .map((h: any) => h.x)
    .sort((a: number, b: number) => a - b)
  expect(wideXs).toEqual([-2.54, 0, 2.54])

  // an explicit p override is honored
  const spaced = fp.string("to220").p(3).circuitJson()
  const spacedXs = spaced
    .filter((el: any) => el.type === "pcb_plated_hole")
    .map((h: any) => h.x)
    .sort((a: number, b: number) => a - b)
  expect(spacedXs).toEqual([-3, 0, 3])
})
