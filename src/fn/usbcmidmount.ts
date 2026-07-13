import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbHoleCircle,
  type PcbPlatedHoleOval,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const usbcmidmount_def = base_def.extend({
  fn: z.literal("usbcmidmount"),
  num_pins: z.literal(16).default(16),
  pinstart: z.coerce.number().int().positive().default(1),
  split: z.boolean().default(false).describe("emit all 16 contact lands"),
  reverse: z
    .boolean()
    .default(false)
    .describe("number contact lands right-to-left"),
  noholes: z.boolean().default(false).describe("omit the two locator holes"),
  rowy: length.default("2.125mm").describe("contact pad row y position"),
  ph: length.default("1.1mm").describe("contact pad height"),
  pw: length.default("0.3mm").describe("signal contact pad width"),
  powerpw: length.default("0.55mm").describe("merged power pad width"),
  powerx: length.default("3.2mm").describe("outer merged power pad x"),
  shellx: length.default("4.325mm").describe("shell tab x position"),
  topy: length.default("1.575mm").describe("upper shell tab y position"),
  bottomy: length
    .default("2.625mm")
    .describe("lower shell tab negative y magnitude"),
  tophw: length.default("0.6mm").describe("upper shell slot width"),
  tophh: length.default("1.5mm").describe("upper shell slot height"),
  topring: length.default("0.25mm").describe("upper shell annular ring"),
  bottomhw: length.default("0.6mm").describe("lower shell slot width"),
  bottomhh: length.default("1.2mm").describe("lower shell slot height"),
  bottomring: length.default("0.3mm").describe("lower shell annular ring"),
  holex: length.default("2.89mm").describe("locator hole x position"),
  holey: length.default("1.055mm").describe("locator hole y position"),
  holed: length.default("0.7mm").describe("locator hole diameter"),
  bodybottom: length
    .default("5.225mm")
    .describe("connector body negative y extent"),
})

const pillPlatedHole = ({
  pin,
  x,
  y,
  holeWidth,
  holeHeight,
  outerWidth,
  outerHeight,
}: {
  pin: number
  x: number
  y: number
  holeWidth: number
  holeHeight: number
  outerWidth: number
  outerHeight: number
}): PcbPlatedHoleOval => ({
  type: "pcb_plated_hole",
  shape: "pill",
  pcb_plated_hole_id: "",
  pcb_component_id: "",
  pcb_port_id: "",
  x,
  y,
  hole_width: holeWidth,
  hole_height: holeHeight,
  outer_width: outerWidth,
  outer_height: outerHeight,
  ccw_rotation: 0,
  layers: ["top", "bottom"],
  port_hints: [pin.toString()],
})

export const usbcmidmount = (
  rawParams: z.input<typeof usbcmidmount_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = usbcmidmount_def.parse(rawParams)
  const {
    pinstart: pinStart,
    split,
    reverse,
    noholes,
    rowy,
    ph,
    pw,
    powerpw,
    powerx,
    shellx,
    topy,
    bottomy,
    tophw,
    tophh,
    topring,
    bottomhw,
    bottomhh,
    bottomring,
    holex,
    holey,
    holed,
    bodybottom,
  } = parameters

  const locatorHoles: PcbHoleCircle[] = noholes
    ? []
    : [-holex, holex].map((x) => ({
        type: "pcb_hole",
        pcb_hole_id: "",
        pcb_component_id: "",
        hole_shape: "circle",
        hole_diameter: holed,
        x,
        y: holey,
      }))
  const shellTabs = [
    pillPlatedHole({
      pin: pinStart,
      x: -shellx,
      y: topy,
      holeWidth: tophw,
      holeHeight: tophh,
      outerWidth: tophw + 2 * topring,
      outerHeight: tophh + 2 * topring,
    }),
    pillPlatedHole({
      pin: pinStart + 1,
      x: shellx,
      y: topy,
      holeWidth: tophw,
      holeHeight: tophh,
      outerWidth: tophw + 2 * topring,
      outerHeight: tophh + 2 * topring,
    }),
    pillPlatedHole({
      pin: pinStart + 2,
      x: -shellx,
      y: -bottomy,
      holeWidth: bottomhw,
      holeHeight: bottomhh,
      outerWidth: bottomhw + 2 * bottomring,
      outerHeight: bottomhh + 2 * bottomring,
    }),
    pillPlatedHole({
      pin: pinStart + 3,
      x: shellx,
      y: -bottomy,
      holeWidth: bottomhw,
      holeHeight: bottomhh,
      outerWidth: bottomhw + 2 * bottomring,
      outerHeight: bottomhh + 2 * bottomring,
    }),
  ]
  const innerPowerX = Number((powerx - 0.8).toFixed(12))
  const mergedSignalXs = [
    -powerx,
    -innerPowerX,
    -1.75,
    -1.25,
    -0.75,
    -0.25,
    0.25,
    0.75,
    1.25,
    1.75,
    innerPowerX,
    powerx,
  ]
  const splitSignalXs = [
    -3.35, -3.05, -2.55, -2.25, -1.75, -1.25, -0.75, -0.25, 0.25, 0.75, 1.25,
    1.75, 2.25, 2.55, 3.05, 3.35,
  ]
  const leftToRightSignalXs = split ? splitSignalXs : mergedSignalXs
  const signalXs = reverse
    ? leftToRightSignalXs.slice().reverse()
    : leftToRightSignalXs
  const signalWidths = split
    ? signalXs.map(() => pw)
    : signalXs.map((_, index) =>
        index < 2 || index >= signalXs.length - 2 ? powerpw : pw,
      )
  const signalPads = signalXs.map((x, index) =>
    rectpad(pinStart + 4 + index, x, rowy, signalWidths[index], ph),
  )
  const silkX = Math.min(shellx - Math.max(tophw, bottomhw) / 2 - 0.2, 4.5)
  const silkscreen = [
    silkscreenpath([
      { x: -silkX, y: -bottomy + bottomhh / 2 + bottomring + 0.2 },
      { x: -silkX, y: topy - tophh / 2 - topring - 0.2 },
    ]),
    silkscreenpath([
      { x: silkX, y: -bottomy + bottomhh / 2 + bottomring + 0.2 },
      { x: silkX, y: topy - tophh / 2 - topring - 0.2 },
    ]),
    silkscreenpath([
      { x: -silkX, y: -bodybottom },
      { x: silkX, y: -bodybottom },
    ]),
  ]
  const topCopper = Math.max(rowy + ph / 2, topy + tophh / 2 + topring)
  const bottomCopper = Math.min(
    -bodybottom,
    -bottomy - bottomhh / 2 - bottomring,
  )
  const courtyardLeft =
    -shellx -
    Math.max(tophw + 2 * topring, bottomhw + 2 * bottomring) / 2 -
    0.25
  const courtyardRight = -courtyardLeft
  const courtyardTop = topCopper + 0.25
  const courtyardBottom = bottomCopper - 0.25
  const ref: SilkscreenRef = silkscreenRef(0, courtyardTop + 0.75, 0.5)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: (courtyardTop + courtyardBottom) / 2 },
    width: courtyardRight - courtyardLeft,
    height: courtyardTop - courtyardBottom,
    layer: "top",
  }

  return {
    circuitJson: [
      ...locatorHoles,
      ...shellTabs,
      ...signalPads,
      ...silkscreen,
      ref,
      courtyard,
    ],
    parameters,
  }
}
