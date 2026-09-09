import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getPads = (definition = "utdfn4") =>
  fp
    .string(definition)
    .circuitJson()
    .filter((item) => item.type === "pcb_smtpad")

test("utdfn4 implements the SGM2036 UTDFN-1x1-4L land pattern", () => {
  const pads = getPads()
  expect(pads.map((pad) => pad.port_hints)).toEqual([
    ["1"],
    ["2"],
    ["3"],
    ["4"],
    ["thermalpad"],
  ])
  expect(pads.every((pad) => pad.shape === "polygon")).toBe(true)
  const bounds = pads.slice(0, 4).map((pad) => {
    if (pad.shape !== "polygon") throw new Error("Expected polygon")
    return [
      Math.min(...pad.points.map((p) => p.x)),
      Math.max(...pad.points.map((p) => p.x)),
      Math.min(...pad.points.map((p) => p.y)),
      Math.max(...pad.points.map((p) => p.y)),
    ]
  })
  const expected = [
    [-0.45, -0.2, -0.65, -0.18],
    [0.2, 0.45, -0.65, -0.25],
    [0.2, 0.45, 0.25, 0.65],
    [-0.45, -0.2, 0.25, 0.65],
  ]
  for (let i = 0; i < 4; i++)
    for (let j = 0; j < 4; j++) {
      expect(bounds[i]![j]).toBeCloseTo(expected[i]![j]!, 10)
    }
  expect(
    convertCircuitJsonToPcbSvg(fp.string("utdfn4").circuitJson()),
  ).toMatchSvgSnapshot(import.meta.path, "utdfn4_sgm2036")
})

test("utdfn4 exposed pad is a 0.48mm square rotated 45 degrees", () => {
  const ep = getPads().find((pad) => pad.port_hints?.includes("thermalpad"))!
  if (ep.shape !== "polygon") throw new Error("Expected diamond")
  expect(ep.points).toHaveLength(4)
  for (let i = 0; i < 4; i++) {
    const a = ep.points[i]!,
      b = ep.points[(i + 1) % 4]!
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(0.48, 10)
    expect(Math.abs(a.x) + Math.abs(a.y)).toBeCloseTo(0.48 / Math.sqrt(2), 10)
    expect(a.x === 0 || a.y === 0).toBe(true)
  }
})

test("utdfn4 corner cuts preserve at least 0.2mm clearance from the exposed pad", () => {
  for (const pad of getPads().slice(0, 4)) {
    if (pad.shape !== "polygon") throw new Error("Expected polygon")
    // Each convex signal pad stays in one quadrant. Its nearest parallel
    // supporting line is separated from the diamond by this distance.
    const minDiagonal = Math.min(
      ...pad.points.map((p) => Math.abs(p.x) + Math.abs(p.y)),
    )
    expect(
      (minDiagonal - 0.48 / Math.sqrt(2)) / Math.sqrt(2),
    ).toBeGreaterThanOrEqual(0.2)
    expect(
      pad.points.every((p) => Number.isFinite(p.x) && Number.isFinite(p.y)),
    ).toBe(true)
  }
})

test("utdfn4 preserves the distinctive extended pin 1 instead of four identical pads", () => {
  const pads = getPads()
  expect(
    pads.slice(0, 4).map((p) => (p.shape === "polygon" ? p.points.length : 0)),
  ).toEqual([4, 5, 5, 5])
})

test("utdfn accepts catalog spelling and optional pin count", () => {
  const expected = getPads()
  for (const definition of ["utdfn", "UTDFN4", "UTDFN-4", "UTDFN-4-EP(1x1)"]) {
    expect(getPads(definition)).toEqual(expected)
  }
  expect(fp().utdfn().circuitJson()).toEqual(fp.string("utdfn4").circuitJson())
})

test("utdfn rejects other pin counts", () => {
  for (const definition of ["utdfn3", "utdfn6"]) {
    expect(() => fp.string(definition).circuitJson()).toThrow()
  }
})

test("utdfn applies shared silkscreen and refdes modifiers", () => {
  const result = fp
    .string("UTDFN-4-EP(1x1)_nosilkscreen_norefdes")
    .circuitJson()
  expect(
    result.filter((item) => item.type.startsWith("pcb_silkscreen")),
  ).toHaveLength(0)
  expect(result.filter((item) => item.type === "pcb_smtpad")).toHaveLength(5)
})

test("utdfn exposed pad can be omitted explicitly", () => {
  const result = fp().utdfn(4).ep(false).circuitJson()
  expect(result.filter((item) => item.type === "pcb_smtpad")).toHaveLength(4)
  expect(convertCircuitJsonToPcbSvg(result)).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4_no_ep",
  )
})
