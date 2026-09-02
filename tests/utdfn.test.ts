import { expect, test } from "bun:test"
import Flatten from "@flatten-js/core"
import { logSoup } from "@tscircuit/log-soup"
import type { PcbSmtPad, Point } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

const getSmtPads = (footprint: ReturnType<typeof fp.string>) =>
  footprint
    .circuitJson()
    .filter((element): element is PcbSmtPad => element.type === "pcb_smtpad")

test("utdfn4 matches the KiCad windmill land pattern", async () => {
  const footprint = fp.string("utdfn4")
  const circuitJson = footprint.circuitJson()
  const pads = getSmtPads(footprint)

  expect(pads).toHaveLength(5)
  expect(pads.slice(0, 4).map((pad) => pad.port_hints)).toEqual([
    ["1"],
    ["2"],
    ["3"],
    ["4"],
  ])

  const expectedSignalPadPoints: Point[][] = [
    [
      { x: -0.18, y: 0.45 },
      { x: -0.65, y: 0.45 },
      { x: -0.65, y: 0.2 },
      { x: -0.43, y: 0.2 },
    ],
    [
      { x: -0.25, y: -0.38 },
      { x: -0.25, y: -0.45 },
      { x: -0.65, y: -0.45 },
      { x: -0.65, y: -0.2 },
      { x: -0.43, y: -0.2 },
    ],
    [
      { x: 0.25, y: -0.38 },
      { x: 0.25, y: -0.45 },
      { x: 0.65, y: -0.45 },
      { x: 0.65, y: -0.2 },
      { x: 0.43, y: -0.2 },
    ],
    [
      { x: 0.25, y: 0.38 },
      { x: 0.25, y: 0.45 },
      { x: 0.65, y: 0.45 },
      { x: 0.65, y: 0.2 },
      { x: 0.43, y: 0.2 },
    ],
  ]

  for (const [padIndex, expectedPoints] of expectedSignalPadPoints.entries()) {
    const pad = pads[padIndex]
    expect(pad?.shape).toBe("polygon")
    if (pad?.shape !== "polygon") continue
    for (const [pointIndex, expectedPoint] of expectedPoints.entries()) {
      expect(pad.points[pointIndex]?.x).toBeCloseTo(expectedPoint.x)
      expect(pad.points[pointIndex]?.y).toBeCloseTo(expectedPoint.y)
    }
  }

  expect(pads[4]).toMatchObject({
    shape: "rotated_rect",
    width: 0.48,
    height: 0.48,
    ccw_rotation: 45,
    port_hints: ["thermalpad"],
  })

  if (process.env.LOG_SOUP) {
    await logSoup("footprinter: utdfn4", circuitJson)
  }
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "utdfn4",
  )
})

test("utdfn4 dimensions are overridable", () => {
  const pads = getSmtPads(
    fp.string(
      "utdfn4_p0.5mm_pw0.2mm_pl0.35mm_p1l0.42mm_span1.2mm_thermalpad0.44x0.46mm",
    ),
  )
  const signalPadPoints = pads
    .slice(0, 4)
    .flatMap((pad) => (pad.shape === "polygon" ? pad.points : []))

  expect(Math.max(...signalPadPoints.map(({ x }) => x))).toBeCloseTo(0.6)
  expect(Math.min(...signalPadPoints.map(({ x }) => x))).toBeCloseTo(-0.6)
  expect(Math.max(...signalPadPoints.map(({ y }) => y))).toBeCloseTo(0.35)
  expect(Math.min(...signalPadPoints.map(({ y }) => y))).toBeCloseTo(-0.35)
  expect(pads[4]).toMatchObject({ width: 0.44, height: 0.46 })
})

test("utdfn4 supports global pin1location and rounded modifiers", () => {
  const pads = getSmtPads(
    fp.string("utdfn4_pin1location(bottomside,right)_rounded0"),
  )
  const pin1 = pads.find((pad) => pad.port_hints?.includes("1"))
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))

  expect(pin1?.shape).toBe("polygon")
  if (pin1?.shape === "polygon") {
    const xs = pin1.points.map(({ x }) => x)
    const ys = pin1.points.map(({ y }) => y)
    expect((Math.min(...xs) + Math.max(...xs)) / 2).toBeGreaterThan(0)
    expect((Math.min(...ys) + Math.max(...ys)) / 2).toBeLessThan(0)
  }
  expect(thermalPad).toMatchObject({
    shape: "rotated_rect",
    corner_radius: 0,
  })
})

test("UTDFN aliases produce the same footprint", () => {
  const canonical = fp.string("utdfn4").circuitJson()

  for (const alias of [
    "utdfn_4_ep",
    "utdfn4_ep",
    "UTDFN-4-EP",
    "UTDFN-4-EP(1x1)",
  ]) {
    expect(fp.string(alias).circuitJson()).toEqual(canonical)
  }
})

test("utdfn signal pads do not overlap the exposed pad", () => {
  const pads = getSmtPads(fp.string("utdfn4"))
  const thermalPad = pads.find((pad) => pad.port_hints?.includes("thermalpad"))

  expect(thermalPad?.shape).toBe("rotated_rect")
  if (thermalPad?.shape !== "rotated_rect") return

  const halfDiagonal = (thermalPad.width * Math.SQRT2) / 2
  const exposedPadPolygon = new Flatten.Polygon([
    [thermalPad.x, thermalPad.y + halfDiagonal],
    [thermalPad.x + halfDiagonal, thermalPad.y],
    [thermalPad.x, thermalPad.y - halfDiagonal],
    [thermalPad.x - halfDiagonal, thermalPad.y],
  ])

  for (const signalPad of pads.filter(
    (pad) => !pad.port_hints?.includes("thermalpad"),
  )) {
    expect(signalPad.shape).toBe("polygon")
    if (signalPad.shape !== "polygon") continue
    const signalPadPolygon = new Flatten.Polygon(
      signalPad.points.map(({ x, y }) => [x, y]),
    )
    const intersection = Flatten.BooleanOperations.intersect(
      signalPadPolygon,
      exposedPadPolygon,
    )

    expect(Math.abs(intersection.area())).toBeLessThan(1e-12)
  }
})
