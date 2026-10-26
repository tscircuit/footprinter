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

test("to220 uses standard 2.54mm pitch (fixes #790)", () => {
  const circuitJson = fp.string("to220_3").circuitJson()
  const holes = circuitJson.filter((e) => e.type === "pcb_plated_hole") as any[]
  expect(holes.length).toBe(3)

  expect(holes[0].x).toBeCloseTo(-2.54, 2)
  expect(holes[1].x).toBeCloseTo(0, 2)
  expect(holes[2].x).toBeCloseTo(2.54, 2)

  // Pin 1: rectangular pad
  expect(holes[0].shape).toBe("circular_hole_with_rect_pad")
  // Pins 2 & 3: pill pads
  expect(holes[1].shape).toBe("pill")
  expect(holes[2].shape).toBe("pill")

  // Changing body width must not change lead pitch
  const wideCircuit = fp.string("to220_3_w15mm").circuitJson()
  const wideHoles = wideCircuit.filter(
    (e) => e.type === "pcb_plated_hole",
  ) as any[]
  expect(wideHoles[0].x).toBeCloseTo(-2.54, 2)
  expect(wideHoles[2].x).toBeCloseTo(2.54, 2)

  // Explicit p parameter must be respected
  const customPitchCircuit = fp.string("to220_3_p3mm").circuitJson()
  const customHoles = customPitchCircuit.filter(
    (e) => e.type === "pcb_plated_hole",
  ) as any[]
  expect(customHoles[0].x).toBeCloseTo(-3.0, 2)
  expect(customHoles[2].x).toBeCloseTo(3.0, 2)
})
