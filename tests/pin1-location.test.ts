import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

const getPads = (
  circuitJson: ReturnType<ReturnType<typeof fp>["circuitJson"]>,
) =>
  circuitJson.filter(
    (element) =>
      element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
  )

const getPin1 = (
  circuitJson: ReturnType<ReturnType<typeof fp>["circuitJson"]>,
) =>
  getPads(circuitJson).find((pad) =>
    pad.port_hints?.some((hint) => /^(?:pin)?1$/i.test(String(hint))),
  )!

test("pin1location(leftside,top) leaves an already matching SOIC unchanged", () => {
  const original = fp.string("soic8").circuitJson()
  const positioned = fp.string("soic8_pin1location(leftside,top)").circuitJson()
  const pads = getPads(positioned)

  expect(positioned).toEqual(original)
  expect(pads).toHaveLength(8)
  expect(pads.every((pad) => pad.shape === "rect")).toBe(true)
})

test("pin1location(topside,left) rotates a complete footprint", () => {
  const original = fp.string("crystal").circuitJson() as any[]
  const positioned = fp
    .string("crystal_pin1location(topside,left)")
    .circuitJson() as any[]
  const pin1 = getPin1(positioned)
  const pads = getPads(positioned)
  const courtyardBefore = original.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  const courtyardAfter = positioned.find(
    (element) => element.type === "pcb_courtyard_rect",
  )
  const silkBefore = original.find(
    (element) => element.type === "pcb_silkscreen_path",
  )
  const silkAfter = positioned.find(
    (element) => element.type === "pcb_silkscreen_path",
  )

  expect(pin1.y).toBe(Math.max(...pads.map((pad) => pad.y)))
  expect(pin1.x).toBeLessThan(0)
  expect(pin1.ccw_rotation).toBe(270)
  expect(courtyardAfter.width).toBe(courtyardBefore.height)
  expect(courtyardAfter.height).toBe(courtyardBefore.width)
  expect(silkAfter.route[0]).toEqual({
    x: silkBefore.route[0].y,
    y: -silkBefore.route[0].x,
  })
})

test("the builder API supports the global pin1location property", () => {
  const fromBuilder = fp()
    .crystal()
    .pin1location("topside", "left")
    .circuitJson()
  const fromString = fp
    .string("crystal_pin1location(topside,left)")
    .circuitJson()

  expect(fromBuilder).toEqual(fromString)
})

test("origin is applied after pin1location", () => {
  const positioned = fp()
    .crystal()
    .pin1location("topside", "left")
    .origin("pin1")
    .circuitJson()
  const pin1 = getPin1(positioned)

  expect(pin1.x).toBeCloseTo(0)
  expect(pin1.y).toBeCloseTo(0)
})

test("polygon pad points rotate without applying a second pad rotation", () => {
  const original = fp.string("sot89_3").circuitJson() as any[]
  const positioned = fp
    .string("sot89_3_pin1location(topside,right)")
    .circuitJson() as any[]
  const polygonBefore = original.find(
    (element) => element.type === "pcb_smtpad" && element.shape === "polygon",
  )
  const polygonAfter = positioned.find(
    (element) => element.type === "pcb_smtpad" && element.shape === "polygon",
  )

  expect(polygonAfter.points[0]).toEqual({
    x: polygonBefore.points[0].y,
    y: -polygonBefore.points[0].x,
  })
  expect(polygonAfter.ccw_rotation).toBeUndefined()
})

test("pin1location rejects invalid and mirrored-only locations", () => {
  expect(() =>
    fp.string("crystal_pin1location(leftside,left)").circuitJson(),
  ).toThrow()
  expect(() =>
    fp.string("qfp16_pin1location(topside,left)").circuitJson(),
  ).toThrow(/cannot be reached with a rotation/)
})
