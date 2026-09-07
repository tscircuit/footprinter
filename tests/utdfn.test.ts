import { expect, test } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("UTDFN-4-EP matches the X2-DFN1010-4 Type B land pattern", () => {
  const circuit = fp.string("utdfn4").circuitJson()
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(pads).toHaveLength(5)
  expect(pads.map((p) => p.port_hints)).toEqual([
    ["1"],
    ["2"],
    ["3"],
    ["4"],
    ["thermalpad"],
  ])
  for (const pad of pads) expect(pad.shape).toBe("polygon")
  const polygons = pads.filter((p) => p.shape === "polygon")
  // Independent values from the manufacturer's drawing, not the generator.
  const centers = [
    [-0.325, 0.375],
    [-0.325, -0.375],
    [0.325, -0.375],
    [0.325, 0.375],
  ]
  for (let i = 0; i < 4; i++) {
    const points = polygons[i]!.points
    const xs = points.map((p) => p.x)
    const ys = points.map((p) => p.y)
    expect(points).toHaveLength(5)
    expect(Math.max(...xs) - Math.min(...xs)).toBeCloseTo(0.35, 8)
    expect(Math.max(...ys) - Math.min(...ys)).toBeCloseTo(0.35, 8)
    expect((Math.max(...xs) + Math.min(...xs)) / 2).toBeCloseTo(
      centers[i]![0]!,
      8,
    )
    expect((Math.max(...ys) + Math.min(...ys)) / 2).toBeCloseTo(
      centers[i]![1]!,
      8,
    )
    // Every signal vertex is outside the EP's diamond half-plane with clearance.
    for (const p of points)
      expect(Math.abs(p.x) + Math.abs(p.y)).toBeGreaterThan(
        0.53 / Math.sqrt(2) + 0.1,
      )
  }
  const ep = polygons[4]!.points
  expect(ep).toHaveLength(4)
  for (let i = 0; i < 4; i++) {
    const a = ep[i]!,
      b = ep[(i + 1) % 4]!
    expect(Math.hypot(a.x - b.x, a.y - b.y)).toBeCloseTo(0.53, 8)
    expect(Math.min(Math.abs(a.x), Math.abs(a.y))).toBe(0)
  }
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4",
  )
})

test("UTDFN catalog spelling and builder resolve to the same footprint", () => {
  const base = fp.string("utdfn4").circuitJson()
  expect(fp.string("UTDFN-4-EP(1x1)").circuitJson()).toEqual(base)
  expect(fp().utdfn(4).circuitJson()).toEqual(base)
  expect(fp().utdfn().circuitJson()).toEqual(base)
  expect(convertCircuitJsonToPcbSvg(base)).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4-alias",
  )
})

test("UTDFN only accepts its supported pin count", () => {
  expect(() => fp.string("utdfn6").circuitJson()).toThrow()
})
