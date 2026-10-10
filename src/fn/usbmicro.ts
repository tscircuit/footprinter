import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbPlatedHoleOval,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "dimension must be finite and positive",
)
const finiteLength = length.refine(Number.isFinite, "dimension must be finite")

// Amphenol 10118194-0001LF front-flange Micro-B drawing, sheet 1:
// https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/10118194.pdf
// The front slots use a centered pill land, not the factory offset D-shaped land.
export const usbmicro_def = base_def
  .extend({
    fn: z.literal("usbmicro"),
    num_pins: z.literal(5).default(5),
    frontflange: z.literal(true).default(true),
    noflange: z.literal(false).default(false),
    pinstart: z.coerce.number().int().positive().default(1),
    reverse: z.boolean().default(false),
    p: positiveLength.default("0.65mm").describe("electrical contact pitch"),
    pw: positiveLength
      .default("0.4mm")
      .describe("electrical contact pad width"),
    ph: positiveLength
      .default("1.35mm")
      .describe("electrical contact pad height"),
    rowy: finiteLength
      .default("2.675mm")
      .describe("contact row from front slots"),
    rearspan: positiveLength
      .default("5mm")
      .describe("rear shell slot center span"),
    reary: finiteLength
      .default("2.7mm")
      .describe("rear shell row from front slots"),
    rearhw: positiveLength.default("0.85mm").describe("rear shell slot width"),
    rearhh: positiveLength.default("0.55mm").describe("rear shell slot height"),
    rearring: positiveLength
      .default("0.2mm")
      .describe("rear shell annular ring"),
    frontspan: positiveLength
      .default("7mm")
      .describe("front shell slot center span"),
    fronthw: positiveLength.default("0.5mm").describe("front shell slot width"),
    fronthh: positiveLength
      .default("1.15mm")
      .describe("front shell slot height"),
    frontpw: positiveLength
      .default("1mm")
      .describe("centered front shell land width"),
    frontph: positiveLength
      .default("1.55mm")
      .describe("centered front shell land height"),
    tabspan: positiveLength
      .default("2mm")
      .describe("inner shell SMT tab center span"),
    tabpw: positiveLength
      .default("1.5mm")
      .describe("inner shell SMT tab pad width"),
    tabph: positiveLength
      .default("1.55mm")
      .describe("inner shell SMT tab pad height"),
    w: positiveLength
      .default("8mm")
      .describe("body width including front flange"),
    bodytop: positiveLength
      .default("2.7mm")
      .describe("body extent behind front slots"),
    bodybottom: positiveLength
      .default("2.3mm")
      .describe("body extent toward mating edge"),
  })
  .superRefine((params, ctx) => {
    for (const [invalid, field, message] of [
      [params.pw >= params.p, "pw", "contact pads must be narrower than pitch"],
      [
        params.frontpw <= params.fronthw,
        "frontpw",
        "front land must surround slot width",
      ],
      [
        params.frontph <= params.fronthh,
        "frontph",
        "front land must surround slot height",
      ],
      [
        params.tabpw >= params.tabspan,
        "tabpw",
        "inner shell pads must remain separate",
      ],
    ] as const) {
      if (invalid)
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field], message })
    }
  })

export type UsbMicroDef = z.input<typeof usbmicro_def>

export const usbmicro = (
  rawParams: UsbMicroDef,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof usbmicro_def>
} => {
  const parameters = usbmicro_def.parse(rawParams)
  const {
    pinstart,
    reverse,
    p,
    pw,
    ph,
    rowy,
    rearspan,
    reary,
    rearhw,
    rearhh,
    rearring,
    frontspan,
    fronthw,
    fronthh,
    frontpw,
    frontph,
    tabspan,
    tabpw,
    tabph,
    w,
    bodytop,
    bodybottom,
  } = parameters
  const clean = (value: number) => Number(value.toFixed(12))
  const signalPads = Array.from({ length: 5 }, (_, index) =>
    rectpad(
      pinstart + index,
      clean((reverse ? 2 - index : index - 2) * p),
      rowy,
      pw,
      ph,
    ),
  )
  const slot = (
    pin: number,
    x: number,
    y: number,
    hw: number,
    hh: number,
    ow: number,
    oh: number,
  ): PcbPlatedHoleOval => ({
    type: "pcb_plated_hole",
    shape: "pill",
    pcb_plated_hole_id: "",
    pcb_component_id: "",
    pcb_port_id: "",
    x,
    y,
    hole_width: hw,
    hole_height: hh,
    outer_width: clean(ow),
    outer_height: clean(oh),
    ccw_rotation: 0,
    layers: ["top", "bottom"],
    port_hints: [String(pin)],
  })
  const shellSlots = [
    slot(
      pinstart + 5,
      -rearspan / 2,
      reary,
      rearhw,
      rearhh,
      rearhw + 2 * rearring,
      rearhh + 2 * rearring,
    ),
    slot(
      pinstart + 6,
      rearspan / 2,
      reary,
      rearhw,
      rearhh,
      rearhw + 2 * rearring,
      rearhh + 2 * rearring,
    ),
    slot(pinstart + 7, -frontspan / 2, 0, fronthw, fronthh, frontpw, frontph),
    slot(pinstart + 8, frontspan / 2, 0, fronthw, fronthh, frontpw, frontph),
  ]
  const innerShellPads = [
    rectpad(pinstart + 9, -tabspan / 2, 0, tabpw, tabph),
    rectpad(pinstart + 10, tabspan / 2, 0, tabpw, tabph),
  ]
  const silkGap = Math.max(frontph, tabph) / 2 + 0.2
  const sideSegments = [
    [-bodybottom, Math.min(bodytop, -silkGap)],
    [Math.max(-bodybottom, silkGap), bodytop],
  ].filter(([start, end]) => end! > start!)
  const silkscreen = [
    silkscreenpath([
      { x: -w / 2, y: -bodybottom },
      { x: w / 2, y: -bodybottom },
    ]),
    ...sideSegments.flatMap(([start, end]) =>
      [-w / 2, w / 2].map((x) =>
        silkscreenpath([
          { x, y: start! },
          { x, y: end! },
        ]),
      ),
    ),
  ]
  const halfWidth = Math.max(
    w / 2,
    2 * p + pw / 2,
    rearspan / 2 + rearhw / 2 + rearring,
    frontspan / 2 + frontpw / 2,
    tabspan / 2 + tabpw / 2,
  )
  const top =
    Math.max(
      bodytop,
      rowy + ph / 2,
      reary + rearhh / 2 + rearring,
      frontph / 2,
      tabph / 2,
    ) + 0.25
  const bottom =
    Math.min(
      -bodybottom,
      rowy - ph / 2,
      reary - rearhh / 2 - rearring,
      -frontph / 2,
      -tabph / 2,
    ) - 0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: clean((top + bottom) / 2) },
    width: clean(2 * (halfWidth + 0.25)),
    height: clean(top - bottom),
    layer: "top",
  }
  return {
    circuitJson: [
      ...signalPads,
      ...shellSlots,
      ...innerShellPads,
      ...silkscreen,
      silkscreenRef(0, top + 0.55, 0.5),
      courtyard,
    ],
    parameters,
  }
}
