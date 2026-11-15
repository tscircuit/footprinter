import { expect, test } from "bun:test"
import type { AnyCircuitElement, PcbSmtPad, Point } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { annularpad } from "../src/helpers/annularpad"
import { applyOrigin } from "../src/helpers/apply-origin"
import { applyPin1Location } from "../src/helpers/apply-pin1-location"
import { rectpad } from "../src/helpers/rectpad"

const area = (points: Point[]) =>
  Math.abs(
    points.reduce((sum, a, i) => {
      const b = points[(i + 1) % points.length]!
      return sum + a.x * b.y - b.x * a.y
    }, 0),
  ) / 2
const edgeDistance = (a: Point, b: Point) => {
  const dx = b.x - a.x,
    dy = b.y - a.y
  const t = Math.max(
    0,
    Math.min(1, -(a.x * dx + a.y * dy) / (dx * dx + dy * dy)),
  )
  return Math.hypot(a.x + t * dx, a.y + t * dy)
}
const center = (points: Point[]) => ({
  x:
    (Math.min(...points.map((p) => p.x)) +
      Math.max(...points.map((p) => p.x))) /
    2,
  y:
    (Math.min(...points.map((p) => p.y)) +
      Math.max(...points.map((p) => p.y))) /
    2,
})

test("annular copper sectors join and retain a genuinely clear center", () => {
  const sectors = annularpad(1, 0, 0, 1.025, 1.625)
  let actualArea = 0
  for (const sector of sectors) {
    if (sector.shape !== "polygon") throw Error("expected polygon")
    expect(sector.points).toHaveLength(66)
    actualArea += area(sector.points)
    for (let i = 0; i < sector.points.length; i++) {
      const a = sector.points[i]!,
        b = sector.points[(i + 1) % sector.points.length]!
      expect(Math.hypot(a.x, a.y)).toBeCloseTo(
        i < 33 ? 1.625 / 2 : 1.025 / 2,
        12,
      )
      expect(edgeDistance(a, b)).toBeGreaterThanOrEqual(
        (1.025 / 2) * Math.cos(Math.PI / 128) - 1e-12,
      )
      expect(edgeDistance(a, b) - 0.5 / 2).toBeGreaterThan(0.26234)
    }
  }
  for (let i = 0; i < sectors.length; i++) {
    const a = sectors[i]!,
      b = sectors[(i + 1) % sectors.length]!
    if (a.shape !== "polygon" || b.shape !== "polygon")
      throw Error("expected polygon")
    for (const [ai, bi] of [
      [32, 0],
      [33, 65],
    ] as const) {
      expect(a.points[ai]!.x).toBeCloseTo(b.points[bi]!.x, 12)
      expect(a.points[ai]!.y).toBeCloseTo(b.points[bi]!.y, 12)
    }
  }
  const idealArea = Math.PI * ((1.625 / 2) ** 2 - (1.025 / 2) ** 2)
  expect(Math.abs(actualArea - idealArea) / idealArea).toBeLessThan(0.000402)
})

const multiContact = (): AnyCircuitElement[] => [
  ...annularpad(1, -2, 1, 0.6, 1.2).map((p) => ({
    ...p,
    port_hints: ["1", "GND"],
  })),
  ...annularpad(2, 2, -1, 0.6, 1.2).map((p) => ({
    ...p,
    port_hints: ["2", "GND"],
  })),
  rectpad(3, 2, 1, 0.4, 0.4),
  {
    type: "pcb_hole",
    pcb_hole_id: "acoustic",
    hole_shape: "circle",
    x: -2,
    y: 1,
    hole_diameter: 0.2,
  },
]
const contactCenter = (circuit: AnyCircuitElement[], owner: string) => {
  const pads = circuit.filter(
    (p): p is Extract<PcbSmtPad, { shape: "polygon" }> =>
      p.type === "pcb_smtpad" &&
      p.shape === "polygon" &&
      p.port_hints?.[0] === owner,
  )
  return center(pads.flatMap((p) => p.points))
}

test("polygon pin1 origin groups physical owners independently of shared electrical aliases", () => {
  const moved = applyOrigin(multiContact(), "pin1")
  expect(contactCenter(moved, "1").x).toBeCloseTo(0, 12)
  expect(contactCenter(moved, "1").y).toBeCloseTo(0, 12)
  expect(contactCenter(moved, "2").x).toBeCloseTo(4, 12)
  expect(contactCenter(moved, "2").y).toBeCloseTo(-2, 12)
  expect(moved.find((p) => p.type === "pcb_hole")).toMatchObject({ x: 0, y: 0 })
})

test("polygon pin1 location rotates complete contacts and preserves shared aliases", () => {
  const moved = applyPin1Location(multiContact(), ["bottomside", "left"])
  expect(contactCenter(moved, "1").x).toBeCloseTo(-1, 12)
  expect(contactCenter(moved, "1").y).toBeCloseTo(-2, 12)
  expect(contactCenter(moved, "2").x).toBeCloseTo(1, 12)
  expect(contactCenter(moved, "2").y).toBeCloseTo(2, 12)
  expect(moved.find((p) => p.type === "pcb_hole")).toMatchObject({
    x: -1,
    y: -2,
  })
  expect(convertCircuitJsonToPcbSvg(moved)).toMatchSvgSnapshot(
    import.meta.path,
    "smtpad-annular-contact-rotation",
  )
})

test("unlabeled polygon origin uses only the selected polygon bounds", () => {
  const circuit: AnyCircuitElement[] = [
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "a",
      shape: "polygon",
      layer: "top",
      points: [
        { x: -3, y: 2 },
        { x: -1, y: 2 },
        { x: -1, y: 4 },
        { x: -3, y: 4 },
      ],
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "b",
      shape: "polygon",
      layer: "top",
      points: [
        { x: 2, y: -4 },
        { x: 4, y: -4 },
        { x: 4, y: -2 },
        { x: 2, y: -2 },
      ],
    },
  ]
  const moved = applyOrigin(circuit, "pin1")
  const first = moved[0],
    second = moved[1]
  if (
    first?.type !== "pcb_smtpad" ||
    first.shape !== "polygon" ||
    second?.type !== "pcb_smtpad" ||
    second.shape !== "polygon"
  )
    throw Error("expected polygon pads")
  expect(center(first.points)).toEqual({ x: 0, y: 0 })
  expect(center(second.points)).toEqual({ x: 5, y: -6 })
})
