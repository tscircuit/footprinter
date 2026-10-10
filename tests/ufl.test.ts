import { expect, test } from "bun:test"
import { pcb_keepout } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"
import source from "./fixtures/ufl-source.json"
import {
  rotatePoint,
  verifyCopperDisjoint,
  verifyKeepoutUnion,
} from "./fixtures/verify-package-keepouts"

test("ufl matches Hirose lands and the conservative source-derived ground gap", () => {
  const circuit = fp.string("ufl").circuitJson()
  expect(any_footprinter_def.parse(fp.string("ufl").json())).toMatchObject({
    fn: "ufl",
    num_pins: 3,
  })
  const copper = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(copper).toHaveLength(3)
  for (const [index, expected] of source.copper.entries()) {
    const { pin, ...geometry } = expected
    expect(copper[index]).toMatchObject({ ...geometry, port_hints: [pin] })
  }
  const keepouts = circuit.filter((e) => e.type === "pcb_keepout")
  expect(keepouts).toHaveLength(3)
  for (const keepout of keepouts) {
    expect(pcb_keepout.parse(keepout)).toMatchObject({
      layers: ["top"],
      allow_traces: false,
      allow_placements: false,
      warning_only: false,
    })
  }
  verifyKeepoutUnion(circuit, source.polygons, source.area)
  verifyCopperDisjoint(circuit)
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "ufl-hirose",
  )
})

test("ufl semantic land dimensions derive the clear region and copper centering", () => {
  const standard = fp.string("ufl").circuitJson()
  const scaled = fp()
    .ufl()
    .p(5.9)
    .pw(4.4)
    .ph(2.1)
    .signalw(2.1)
    .signalh(2)
    .signalx(-3.05)
    .circuitJson()
  for (const [index, element] of standard.entries()) {
    const actual = scaled[index]!
    if (
      element.type === "pcb_smtpad" &&
      actual.type === "pcb_smtpad" &&
      element.shape === "rect" &&
      actual.shape === "rect"
    ) {
      for (const key of ["x", "y", "width", "height"] as const)
        expect(actual[key]).toBeCloseTo(element[key] * 2, 12)
    } else if (
      element.type === "pcb_keepout" &&
      element.shape === "rect" &&
      actual.type === "pcb_keepout" &&
      actual.shape === "rect"
    ) {
      expect(actual.center.x).toBeCloseTo(element.center.x * 2, 12)
      expect(actual.center.y).toBeCloseTo(element.center.y * 2, 12)
      expect(actual.width).toBeCloseTo(element.width * 2, 12)
      expect(actual.height).toBeCloseTo(element.height * 2, 12)
    } else throw new Error("unexpected element")
  }
  verifyCopperDisjoint(scaled)
  expect(
    fp
      .string(
        "ufl_p2950um_pw2200um_ph1050um_signalw1050um_signalh1000um_signalx-1525um",
      )
      .circuitJson(),
  ).toEqual(standard)
  expect(convertCircuitJsonToPcbSvg(scaled)).toMatchSvgSnapshot(
    import.meta.path,
    "ufl-scaled-dimensions",
  )
})

test("ufl rejects malformed dimensions and overlapping signal-ground geometry", () => {
  for (const value of [
    "0",
    "-1",
    "1.2.3mm",
    "1mm text",
    "1e3",
    "NaN",
    "Infinity",
    true,
  ]) {
    expect(() => fp().ufl().p(value).circuitJson()).toThrow()
  }
  for (const recipe of [
    "ufl_p1mm",
    "ufl_signalh2mm",
    "ufl_signalx0mm",
    "ufl_signalx-3mm",
    "ufl_signalw6mm",
  ])
    expect(() => fp.string(recipe).circuitJson()).toThrow()
})

test("ufl rotates the complete hard gap and translates it to pin 1", () => {
  const variants = [
    { angle: 0, location: ["topside", "right"] },
    { angle: 90, location: ["leftside", "top"] },
    { angle: 180, location: ["bottomside", "left"] },
    { angle: 270, location: ["rightside", "bottom"] },
  ] as const
  for (const { angle, location } of variants) {
    const circuit = fp()
      .ufl()
      .pin1location(...location)
      .origin("pin1")
      .circuitJson()
    const pin1 = rotatePoint({ x: 0.475, y: 1.475 }, angle)
    const polygons = source.polygons.map((p) => ({
      points: p.points.map((point) => {
        const rotated = rotatePoint(point, angle)
        return { x: rotated.x - pin1.x, y: rotated.y - pin1.y }
      }),
    }))
    verifyKeepoutUnion(circuit, polygons, source.area)
    verifyCopperDisjoint(circuit)
    expect(circuit[0]).toMatchObject({ x: 0, y: 0, port_hints: ["1"] })
    if (angle === 90)
      expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
        import.meta.path,
        "ufl-rotated-pin1-origin",
      )
  }
})
