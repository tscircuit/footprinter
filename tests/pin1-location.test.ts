import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"
import { applyPin1Location } from "../src/helpers/apply-pin1-location"

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

  expect(positioned).toEqual(original)
})

test("pin1location(topside,left) orients a complete footprint", () => {
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
  const refdesAfter = positioned.find(
    (element) => element.type === "pcb_silkscreen_text",
  )

  expect(pin1.y).toBe(Math.max(...pads.map((pad) => pad.y)))
  expect(pin1.x).toBeLessThan(0)
  expect(pin1.ccw_rotation).toBe(180)
  expect(courtyardAfter.width).toBe(courtyardBefore.width)
  expect(courtyardAfter.height).toBe(courtyardBefore.height)
  expect(silkAfter.route[0]).toEqual({
    x: silkBefore.route[0].x,
    y: -silkBefore.route[0].y,
  })
  expect(refdesAfter.is_mirrored).toBe(true)
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

test("pin1location infers reflection from the requested pin ordering", () => {
  const positioned = fp
    .string("qfp16_pin1location(topside,left)")
    .circuitJson() as any[]
  const pin1 = getPin1(positioned)
  const pin2 = getPads(positioned).find((pad) => pad.port_hints?.includes("2"))!
  const refdes = positioned.find(
    (element) => element.type === "pcb_silkscreen_text",
  )

  expect(pin1.y).toBe(Math.max(...getPads(positioned).map((pad) => pad.y)))
  expect(pin1.x).toBeLessThan(0)
  expect(pin2.y).toBe(pin1.y)
  expect(pin2.x).toBeGreaterThan(pin1.x)
  expect(refdes.is_mirrored).toBe(true)
})

test("pin ordering disambiguates the side of a corner pin", () => {
  const original = fp.string("dip8_pin1location(leftside,top)").circuitJson()
  const positioned = fp.string("dip8_pin1location(topside,left)").circuitJson()
  const pin1 = getPin1(positioned)
  const pin2 = getPads(positioned).find((pad) => pad.port_hints?.includes("2"))!

  expect(original).toEqual(fp.string("dip8").circuitJson())
  expect(pin2.y).toBe(pin1.y)
  expect(pin2.x).toBeGreaterThan(pin1.x)
})

test("reflections transform existing rotations and anchor alignment", () => {
  const positioned = applyPin1Location(
    [
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: -2,
        y: 1,
        width: 1,
        height: 0.5,
        layer: "top",
        pcb_smtpad_id: "",
        port_hints: ["1"],
      },
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: -2,
        y: -1,
        width: 1,
        height: 0.5,
        layer: "top",
        pcb_smtpad_id: "",
        port_hints: ["2"],
      },
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: 2,
        y: -1,
        width: 1,
        height: 0.5,
        layer: "top",
        pcb_smtpad_id: "",
        port_hints: ["3"],
      },
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: 2,
        y: 2,
        width: 1,
        height: 0.5,
        layer: "top",
        pcb_smtpad_id: "",
        port_hints: ["4"],
      },
      {
        type: "pcb_silkscreen_text",
        pcb_silkscreen_text_id: "",
        pcb_component_id: "",
        font: "tscircuit2024",
        font_size: 0.3,
        text: "REF",
        layer: "top",
        anchor_position: { x: 1, y: 1 },
        anchor_alignment: "top_right",
        ccw_rotation: 30,
      },
    ],
    ["topside", "left"],
  ) as any[]
  const text = positioned.find(
    (element) => element.type === "pcb_silkscreen_text",
  )

  expect(text.ccw_rotation).toBe(60)
  expect(text.is_mirrored).toBe(true)
  expect(text.anchor_alignment).toBe("bottom_left")
})

test("pin1location rejects invalid side and alignment pairs", () => {
  expect(() =>
    fp.string("crystal_pin1location(leftside,left)").circuitJson(),
  ).toThrow()
})
