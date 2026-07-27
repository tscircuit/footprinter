import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbHoleCircle,
  length,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { base_def } from "../helpers/zod/base_def"

export const rj45_def = base_def.extend({
  fn: z.literal("rj45"),
  num_pins: z.union([z.literal(10), z.literal(14)]).default(10),
  ledpins: z
    .boolean()
    .default(false)
    .describe("add the four through-hole LED connections as pins 9 through 12"),
  firstpinleft: z
    .boolean()
    .default(false)
    .describe("mirror the eight signal pins so pin 1 is on the left"),
  firstpintop: z
    .boolean()
    .default(false)
    .describe("mirror the eight signal pins so pin 1 is in the top row"),
  p: length.default("1.02mm").describe("horizontal signal-pin pitch"),
  py: length.default("1.78mm").describe("signal-row pitch"),
  id: length.default("0.9144mm").describe("signal and LED hole diameter"),
  od: length.default("1.524mm").describe("signal and LED outer diameter"),
  shieldx: length
    .default("8.13mm")
    .describe("shield-pin x offset from the footprint center"),
  shieldy: length
    .default("0.13mm")
    .describe("signed shield-pin y offset from the signal-row center"),
  shieldid: length.default("1.8mm").describe("shield-pin hole diameter"),
  shieldod: length.default("2.5mm").describe("shield-pin outer diameter"),
  holex: length
    .default("6.35mm")
    .describe("locator-hole x offset from the footprint center"),
  holey: length
    .default("-3.43mm")
    .describe("signed locator-hole y offset from the signal-row center"),
  holed: length.default("3.25mm").describe("locator-hole diameter"),
  ledx: length
    .default("4.57mm")
    .describe("inner LED-pin x offset from the footprint center"),
  ledp: length.default("2.29mm").describe("pitch within each LED-pin pair"),
  ledy: length
    .default("5.7mm")
    .describe("signed LED-pin y offset from the signal-row center"),
  w: length.default("16.26mm").describe("connector body width"),
  h: length.default("15.88mm").describe("connector body height"),
  bodyy: length
    .default("-0.96mm")
    .describe("signed connector body center y offset"),
})

export type Rj45Def = z.input<typeof rj45_def>

export const rj45 = (
  rawParams: Rj45Def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const hasLedPins = rawParams.ledpins === true || rawParams.num_pins === 14
  const parameters = rj45_def.parse({
    ...rawParams,
    ledpins: hasLedPins,
    num_pins: hasLedPins ? 14 : 10,
  })
  const {
    ledpins,
    firstpinleft,
    firstpintop,
    p,
    py,
    id,
    od,
    shieldx,
    shieldy,
    shieldid,
    shieldod,
    holex,
    holey,
    holed,
    ledx,
    ledp,
    ledy,
    w,
    h,
    bodyy,
  } = parameters

  const clean = (value: number) => Number(value.toFixed(12))
  const signalPins = Array.from({ length: 8 }, (_, index) => {
    const pin = index + 1
    const defaultX = (3.5 - index) * p
    const defaultY = index % 2 === 0 ? -py / 2 : py / 2
    const x = clean(firstpinleft ? -defaultX : defaultX)
    const y = clean(firstpintop ? -defaultY : defaultY)
    return platedhole(pin, x, y, id, od)
  })

  const ledPins = ledpins
    ? [
        platedhole(9, clean(-ledx - ledp), ledy, id, od),
        platedhole(10, -ledx, ledy, id, od),
        platedhole(11, ledx, ledy, id, od),
        platedhole(12, clean(ledx + ledp), ledy, id, od),
      ]
    : []

  const defaultLeftShieldPin = ledpins ? 14 : 9
  const defaultRightShieldPin = ledpins ? 13 : 10
  const swapShieldPins = firstpinleft !== firstpintop
  const leftShieldPin = swapShieldPins
    ? defaultRightShieldPin
    : defaultLeftShieldPin
  const rightShieldPin = swapShieldPins
    ? defaultLeftShieldPin
    : defaultRightShieldPin
  const shieldPins = [
    platedhole(leftShieldPin, -shieldx, shieldy, shieldid, shieldod),
    platedhole(rightShieldPin, shieldx, shieldy, shieldid, shieldod),
  ]

  const locatorHoles: PcbHoleCircle[] = [-holex, holex].map((x) => ({
    type: "pcb_hole",
    pcb_hole_id: "",
    pcb_component_id: "",
    hole_shape: "circle",
    hole_diameter: holed,
    x,
    y: holey,
  }))

  const bodyLeft = -w / 2
  const bodyRight = w / 2
  const bodyBottom = bodyy - h / 2
  const bodyTop = bodyy + h / 2
  const shieldClearance = shieldod / 2 + 0.2
  const sideSegments = [
    [bodyBottom, Math.min(bodyTop, shieldy - shieldClearance)],
    [Math.max(bodyBottom, shieldy + shieldClearance), bodyTop],
  ].filter(([start, end]) => end - start > 0.01)
  const silkscreen = [
    silkscreenpath([
      { x: bodyLeft, y: bodyBottom },
      { x: bodyRight, y: bodyBottom },
    ]),
    silkscreenpath([
      { x: bodyLeft, y: bodyTop },
      { x: bodyRight, y: bodyTop },
    ]),
    ...sideSegments.flatMap(([start, end]) => [
      silkscreenpath([
        { x: bodyLeft, y: start },
        { x: bodyLeft, y: end },
      ]),
      silkscreenpath([
        { x: bodyRight, y: start },
        { x: bodyRight, y: end },
      ]),
    ]),
  ]

  const copperLeft = Math.min(
    -shieldx - shieldod / 2,
    -holex - holed / 2,
    ledpins ? -ledx - ledp - od / 2 : 0,
  )
  const copperRight = -copperLeft
  const copperBottom = Math.min(
    shieldy - shieldod / 2,
    holey - holed / 2,
    -py / 2 - od / 2,
    ledpins ? ledy - od / 2 : Number.POSITIVE_INFINITY,
  )
  const copperTop = Math.max(
    shieldy + shieldod / 2,
    holey + holed / 2,
    py / 2 + od / 2,
    ledpins ? ledy + od / 2 : Number.NEGATIVE_INFINITY,
  )
  const courtyardLeft = Math.min(bodyLeft, copperLeft) - 0.25
  const courtyardRight = Math.max(bodyRight, copperRight) + 0.25
  const courtyardBottom = Math.min(bodyBottom, copperBottom) - 0.25
  const courtyardTop = Math.max(bodyTop, copperTop) + 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: {
      x: (courtyardLeft + courtyardRight) / 2,
      y: (courtyardBottom + courtyardTop) / 2,
    },
    width: courtyardRight - courtyardLeft,
    height: courtyardTop - courtyardBottom,
    layer: "top",
  }

  return {
    circuitJson: [
      ...locatorHoles,
      ...signalPins,
      ...ledPins,
      ...shieldPins,
      ...silkscreen,
      silkscreenRef(0, courtyardTop + 0.55, 0.5),
      courtyard,
    ],
    parameters,
  }
}
