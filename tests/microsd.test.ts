import { expect, test } from "bun:test"
import { pcb_keepout } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { any_footprinter_def } from "../src/helpers/zod/AnyFootprinterDefinitionOutput"
import source from "./fixtures/dm3at-source.json"
import {
  rotatePoint,
  verifyCopperDisjoint,
  verifyKeepoutUnion,
} from "./fixtures/verify-package-keepouts"

test("microsd_dm3at matches all Hirose lands and keeps switch contacts isolated", () => {
  const circuit = fp.string("microsd_dm3at").circuitJson()
  expect(
    any_footprinter_def.parse(fp.string("microsd_dm3at").json()),
  ).toMatchObject({ fn: "microsd", num_pins: 11, dm3at: true })
  expect(circuit).toEqual(fp().microsd().dm3at().circuitJson())
  const copper = circuit.filter((e) => e.type === "pcb_smtpad")
  expect(copper).toHaveLength(14)
  expect(new Set(copper.flatMap((p) => p.port_hints ?? [])).size).toBe(11)
  expect(copper.slice(-4).map((p) => p.port_hints)).toEqual([
    ["11"],
    ["11"],
    ["11"],
    ["11"],
  ])
  expect(copper.slice(8, 10).map((p) => p.port_hints)).toEqual([["9"], ["10"]])
  for (const [index, expected] of source.copper.entries()) {
    const { pin, ...geometry } = expected
    expect(copper[index]).toMatchObject({ ...geometry, port_hints: [pin] })
  }
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "microsd-dm3at",
  )
})

test("microsd_dm3at represents exactly the four no-pattern polygons as five hard regions", () => {
  const circuit = fp.string("microsd_dm3at").circuitJson()
  const keepouts = circuit.filter((e) => e.type === "pcb_keepout")
  expect(keepouts).toHaveLength(5)
  expect(keepouts).toMatchObject(source.keepouts!)
  for (const keepout of keepouts)
    expect(pcb_keepout.parse(keepout)).toMatchObject({
      layers: ["top"],
      allow_traces: false,
      allow_placements: false,
      warning_only: false,
    })
  verifyKeepoutUnion(circuit, source.polygons, source.area)
  verifyCopperDisjoint(circuit)
  expect(
    fp
      .string("microsd_dm3at_nosilkscreen_norefdes")
      .circuitJson()
      .filter((e) => e.type === "pcb_keepout"),
  ).toEqual(keepouts)
})

test("microsd requires an explicit supported mechanical profile", () => {
  expect(() => fp.string("microsd").circuitJson()).toThrow()
  expect(() => fp.string("microsd_generic").circuitJson()).toThrow()
  expect(() => fp().microsd().dm3at(false).circuitJson()).toThrow()
  expect(() => fp().microsd().dm3at("maybe").circuitJson()).toThrow()
})

test("microsd rotates every mounting restriction and follows the selected origin", () => {
  const variants = [
    { angle: 0, location: ["topside", "right"] },
    { angle: 90, location: ["leftside", "top"] },
    { angle: 180, location: ["bottomside", "left"] },
    { angle: 270, location: ["rightside", "bottom"] },
  ] as const
  for (const { angle, location } of variants) {
    const circuit = fp()
      .microsd()
      .dm3at()
      .pin1location(...location)
      .origin("pin1")
      .circuitJson()
    const polygons = source.polygons.map((p) => ({
      points: p.points.map((point) => rotatePoint(point, angle)),
    }))
    verifyKeepoutUnion(circuit, polygons, source.area)
    verifyCopperDisjoint(circuit)
    expect(circuit[0]).toMatchObject({ port_hints: ["1"] })
    const pin1 = circuit[0]
    if (
      pin1?.type !== "pcb_smtpad" ||
      !["rect", "rotated_rect"].includes(pin1.shape) ||
      !("x" in pin1)
    )
      throw new Error("expected contact 1 land")
    expect(pin1.x).toBeCloseTo(0, 12)
    expect(pin1.y).toBeCloseTo(0, 12)
    if (angle === 90)
      expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
        import.meta.path,
        "microsd-dm3at-rotated",
      )
  }
  const translated = fp().microsd().dm3at().origin("center").circuitJson()
  // Source copper spans x=-10.1..4.55, y=-16.05..0.6.
  const polygons = source.polygons.map((p) => ({
    points: p.points.map(({ x, y }) => ({ x: x + 2.775, y: y + 7.725 })),
  }))
  verifyKeepoutUnion(translated, polygons, source.area)
  verifyCopperDisjoint(translated)
})
