import { expect, test } from "bun:test"
import { pcb_keepout } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import {
  dm3atKeepouts,
  dm3atPads,
  dm3atSourcePolygons,
} from "./fixtures/dm3at-keepouts"

const pointInPolygon = (
  x: number,
  y: number,
  points: readonly (readonly [number, number])[],
) => {
  let inside = false
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i]!
    const [xj, yj] = points[j]!
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

test("padlayout emits exact DM3AT no-pattern regions as hard copper keepouts", () => {
  const circuit = fp()
    .padlayout()
    .smdpads(dm3atPads)
    .keepoutrects(dm3atKeepouts)
    .circuitJson()
  const keepouts = circuit.filter((e) => e.type === "pcb_keepout")
  expect(keepouts).toHaveLength(5)
  for (const keepout of keepouts) {
    expect(pcb_keepout.parse(keepout)).toMatchObject({
      shape: "rect",
      layers: ["top"],
      allow_traces: false,
      allow_placements: false,
      warning_only: false,
    })
  }

  // Every open cell delimited by source and generated edges has constant
  // membership. Check
  // all such cells to prove equality of the union, including the shell-land
  // gap and the notch above the interior stem. This also catches extra area.
  const sourcePoints = dm3atSourcePolygons.flat()
  const rectangleEdges = keepouts.map((k) => {
    if (k.shape !== "rect") throw new Error("expected rectangle")
    return {
      xs: [k.center.x - k.width / 2, k.center.x + k.width / 2],
      ys: [k.center.y - k.height / 2, k.center.y + k.height / 2],
    }
  })
  const gridEdges = (values: number[]) =>
    // Decimal dimensions can differ by machine epsilon after center +/- half.
    [...new Set(values.map((value) => Number(value.toFixed(12))))].sort(
      (a, b) => a - b,
    )
  const xs = gridEdges([
    -11,
    4,
    ...sourcePoints.map(([x]) => x),
    ...rectangleEdges.flatMap((e) => e.xs),
  ])
  const ys = gridEdges([
    -17,
    1,
    ...sourcePoints.map(([, y]) => y),
    ...rectangleEdges.flatMap((e) => e.ys),
  ])
  let sourceArea = 0
  for (let i = 1; i < xs.length; i++) {
    for (let j = 1; j < ys.length; j++) {
      const x = (xs[i - 1]! + xs[i]!) / 2
      const y = (ys[j - 1]! + ys[j]!) / 2
      const sourceContains = dm3atSourcePolygons.some((p) =>
        pointInPolygon(x, y, p),
      )
      const generatedContains = keepouts.some(
        (k) =>
          k.shape === "rect" &&
          Math.abs(x - k.center.x) < k.width / 2 &&
          Math.abs(y - k.center.y) < k.height / 2,
      )
      expect(generatedContains).toBe(sourceContains)
      if (sourceContains) {
        sourceArea += (xs[i]! - xs[i - 1]!) * (ys[j]! - ys[j - 1]!)
      }
    }
  }
  expect(sourceArea).toBeCloseTo(27.82, 10)
  expect(
    keepouts.reduce(
      (area, k) => area + (k.shape === "rect" ? k.width * k.height : 0),
      0,
    ),
  ).toBeCloseTo(sourceArea, 10)

  // Keepout hatches must not become conductive lands or pin ownership.
  const copper = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(copper).toEqual(
    fp()
      .padlayout()
      .smdpads(dm3atPads)
      .circuitJson()
      .filter((e) => e.type === "pcb_smtpad"),
  )
  expect(copper).toHaveLength(14)
  expect(new Set(copper.flatMap((p) => p.port_hints ?? [])).size).toBe(11)
  for (const pad of copper) {
    if (pad.shape !== "rect") throw new Error("expected rectangular copper")
    for (const keepout of keepouts) {
      if (keepout.shape !== "rect") throw new Error("expected rect keepout")
      const overlapWidth = Math.max(
        0,
        Math.min(pad.x + pad.width / 2, keepout.center.x + keepout.width / 2) -
          Math.max(pad.x - pad.width / 2, keepout.center.x - keepout.width / 2),
      )
      const overlapHeight = Math.max(
        0,
        Math.min(
          pad.y + pad.height / 2,
          keepout.center.y + keepout.height / 2,
        ) -
          Math.max(
            pad.y - pad.height / 2,
            keepout.center.y - keepout.height / 2,
          ),
      )
      // Source shell lands abut two hatched boundaries, but share no area.
      expect(overlapWidth * overlapHeight).toBeCloseTo(0, 10)
    }
  }
  expect(
    convertCircuitJsonToPcbSvg(circuit, { showCourtyards: true }),
  ).toMatchSvgSnapshot(import.meta.path, "padlayout-dm3at-hard-keepouts")
})

test("keepoutrects accepts compact strings and preserves copper-only layouts", () => {
  const recipe =
    "padlayout_smdpads(1,0,0,1,1)_keepoutrects(2mm,-3mm,0.75mm,3.25mm)"
  const typed = fp()
    .padlayout()
    .smdpads([[1, 0, 0, 1, 1]])
    .keepoutrects([[2, -3, 0.75, 3.25]])
    .circuitJson()
  expect(fp.string(recipe).circuitJson()).toEqual(typed)
  expect(
    fp()
      .padlayout()
      .smdpads([[1, 0, 0, 1, 1]])
      .keepoutrects("+2mm,-3mm,+0.75,+3.25")
      .circuitJson(),
  ).toEqual(typed)
  expect(
    fp()
      .padlayout()
      .smdpads([[1, 0, 0, 1, 1]])
      .circuitJson()
      .filter((e) => e.type === "pcb_keepout"),
  ).toHaveLength(0)
  expect(convertCircuitJsonToPcbSvg(typed)).toMatchSvgSnapshot(
    import.meta.path,
    "padlayout-simple-keepout",
  )
})

test("keepout rectangles follow pin1location rotation and origin translation", () => {
  const circuit = fp()
    .padlayout()
    .smdpads([
      [1, -2, -1, 0.5, 0.5],
      [2, 2, 1, 0.5, 0.5],
    ])
    .keepoutrects([[4, -3, 0.75, 3.25]])
    .pin1location("leftside", "top")
    .origin("pin1")
    .circuitJson()
  // 270 degrees: (4,-3) -> (-3,-4), then shift rotated pin1 (-1,2)
  // to the origin. Rectangle dimensions must rotate along with its center.
  expect(circuit.filter((e) => e.type === "pcb_keepout")).toMatchObject([
    {
      center: { x: -2, y: -6 },
      width: 3.25,
      height: 0.75,
      layers: ["top"],
    },
  ])
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "padlayout-keepout-origin-rotation",
  )
})

test("keepoutrects rejects malformed geometry and cannot replace copper", () => {
  for (const tuple of [
    "0,0,0,1",
    "0,0,1,-1",
    "NaN,0,1,1",
    "0,0,1",
    "0,0,1..2,1",
    "0,0,1.2.3,1",
    "0,0,1mm garbage,1",
    "0,0,1e3,1",
    "0,0,1,1)garbage",
    "0,0,1,1?",
    "0,0,?,1",
  ]) {
    expect(() =>
      fp
        .string(`padlayout_smdpads(1,0,0,1,1)_keepoutrects(${tuple})`)
        .circuitJson(),
    ).toThrow()
  }
  expect(() =>
    fp.string("padlayout_keepoutrects(0,0,1,1)").circuitJson(),
  ).toThrow("requires at least one copper land")
  expect(() =>
    fp()
      .padlayout()
      .smdpads([[1, 0, 0, 1, 1]])
      .keepoutrects("0,0,1,1)")
      .circuitJson(),
  ).toThrow()
})
