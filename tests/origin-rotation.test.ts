import { expect, test } from "bun:test"
import type {
  PcbSmtPad,
  PcbSmtPadRect,
  PcbSmtPadRotatedPill,
  PcbSmtPadRotatedRect,
} from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"
import { applyOrigin } from "../src/helpers/apply-origin"

const getSmtPads = (
  circuitJson: ReturnType<ReturnType<typeof fp>["circuitJson"]>,
) =>
  circuitJson.filter(
    (element): element is PcbSmtPad => element.type === "pcb_smtpad",
  )

const getRotatedSmtPads = (
  circuitJson: ReturnType<ReturnType<typeof fp>["circuitJson"]>,
) =>
  getSmtPads(circuitJson).filter(
    (pad): pad is PcbSmtPadRotatedRect | PcbSmtPadRotatedPill =>
      pad.shape === "rotated_rect" || pad.shape === "rotated_pill",
  )

const getQuarterTurnCopperMin = (
  circuitJson: ReturnType<ReturnType<typeof fp>["circuitJson"]>,
) => {
  const pads = getRotatedSmtPads(circuitJson)
  return {
    x: Math.min(
      ...pads.map(
        (pad) =>
          pad.x - (pad.ccw_rotation % 180 === 0 ? pad.width : pad.height) / 2,
      ),
    ),
    y: Math.min(
      ...pads.map(
        (pad) =>
          pad.y - (pad.ccw_rotation % 180 === 0 ? pad.height : pad.width) / 2,
      ),
    ),
  }
}

test("bottomleft origin bounds 90 degree SOIC pads", () => {
  const circuitJson = fp
    .string("soic8_pin1location(bottomside,left)")
    .origin("bottomleft")
    .circuitJson()
  const pads = getRotatedSmtPads(circuitJson)
  const copperMin = getQuarterTurnCopperMin(circuitJson)

  expect(pads.every((pad) => pad.ccw_rotation === 90)).toBe(true)
  expect(copperMin.x).toBeCloseTo(0)
  expect(copperMin.y).toBeCloseTo(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_bottomside_left_bottomleft_origin",
  )
})

test("bottomleft origin bounds 270 degree SOIC pads", () => {
  const circuitJson = fp
    .string("soic8_pin1location(topside,right)")
    .origin("bottomleft")
    .circuitJson()
  const pads = getRotatedSmtPads(circuitJson)
  const copperMin = getQuarterTurnCopperMin(circuitJson)

  expect(pads.every((pad) => pad.ccw_rotation === 270)).toBe(true)
  expect(copperMin.x).toBeCloseTo(0)
  expect(copperMin.y).toBeCloseTo(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_topside_right_bottomleft_origin",
  )
})

test("bottomleft origin preserves 0 and 180 degree SOIC pad bounds", () => {
  const circuitJson = fp.string("soic8").origin("bottomleft").circuitJson()
  const pads = getSmtPads(circuitJson).filter(
    (pad): pad is PcbSmtPadRect => pad.shape === "rect",
  )

  expect(pads).toHaveLength(8)
  expect(Math.min(...pads.map((pad) => pad.x - pad.width / 2))).toBeCloseTo(0)
  expect(Math.min(...pads.map((pad) => pad.y - pad.height / 2))).toBeCloseTo(0)

  const rotatedCircuitJson = fp
    .string("soic8_pin1location(rightside,bottom)")
    .origin("bottomleft")
    .circuitJson()
  const rotatedPads = getRotatedSmtPads(rotatedCircuitJson)
  const rotatedCopperMin = getQuarterTurnCopperMin(rotatedCircuitJson)

  expect(rotatedPads.every((pad) => pad.ccw_rotation === 180)).toBe(true)
  expect(rotatedCopperMin.x).toBeCloseTo(0)
  expect(rotatedCopperMin.y).toBeCloseTo(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_unrotated_bottomleft_origin",
  )
  expect(convertCircuitJsonToPcbSvg(rotatedCircuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_rightside_bottom_bottomleft_origin",
  )
})

test("bottomleft origin bounds rotated pill pads", () => {
  const circuitJson = fp
    .string("soic8_pillpads_pin1location(topside,right)")
    .origin("bottomleft")
    .circuitJson()
  const pads = getRotatedSmtPads(circuitJson)
  const copperMin = getQuarterTurnCopperMin(circuitJson)

  expect(pads.every((pad) => pad.shape === "rotated_pill")).toBe(true)
  expect(copperMin.x).toBeCloseTo(0)
  expect(copperMin.y).toBeCloseTo(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_pillpads_topside_right_bottomleft_origin",
  )
})

test("pin1 origin remains centered on the rotated pin", () => {
  const circuitJson = fp
    .string("soic8_pin1location(topside,right)")
    .origin("pin1")
    .circuitJson()
  const pin1 = getRotatedSmtPads(circuitJson).find(
    (pad) => pad.port_hints?.[0] === "1",
  )!

  expect(pin1.x).toBeCloseTo(0)
  expect(pin1.y).toBeCloseTo(0)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "soic8_topside_right_pin1_origin",
  )
})

for (const fixture of [
  {
    shape: "rotated_rect",
    radius: 0.5,
    extent: 2.62132034356,
    name: "rotated_rect",
  },
  {
    shape: "rotated_pill",
    radius: 1,
    extent: 2.41421356237,
    name: "rotated_pill",
  },
  {
    shape: "rotated_pill",
    radius: 0.5,
    extent: 2.62132034356,
    name: "custom_radius_pill",
  },
] as const) {
  test(`bottomleft origin uses tight 45 degree ${fixture.name} bounds`, () => {
    const pad: PcbSmtPadRotatedRect | PcbSmtPadRotatedPill = {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad1",
      x: 0,
      y: 0,
      width: 6,
      height: 2,
      ccw_rotation: 45,
      layer: "top",
      ...(fixture.shape === "rotated_rect"
        ? { shape: fixture.shape, corner_radius: fixture.radius }
        : { shape: fixture.shape, radius: fixture.radius }),
    }
    const circuitJson = applyOrigin([pad], "bottomleft")
    // Radius 0.5: a 5 x 1 core plus a 0.5-radius circle.
    // Radius 1: a length-4 center line plus radius-1 semicircular caps.
    expect(pad.x).toBeCloseTo(fixture.extent)
    expect(pad.y).toBeCloseTo(fixture.extent)
    expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
      import.meta.path,
      `${fixture.name}_45_bottomleft_origin`,
    )
  })
}

test("bottomleft origin honors legacy rotated rectangle border radius", () => {
  const pad: PcbSmtPadRotatedRect = {
    type: "pcb_smtpad",
    pcb_smtpad_id: "pad1",
    shape: "rotated_rect",
    x: 0,
    y: 0,
    width: 6,
    height: 2,
    ccw_rotation: 45,
    layer: "top",
    rect_border_radius: 0.5,
  }
  const circuitJson = applyOrigin([pad], "bottomleft")
  expect(pad.x).toBeCloseTo(2.62132034356)
  expect(pad.y).toBeCloseTo(2.62132034356)
  expect(convertCircuitJsonToPcbSvg(circuitJson)).toMatchSvgSnapshot(
    import.meta.path,
    "legacy_radius_rect_45_bottomleft_origin",
  )
})
