import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "../helpers/platedhole"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "dimension must be finite and positive",
)

// Amphenol UE27AC54100 right-angle USB-A, component-side PCB layout, sheet 1:
// https://cdn.amphenol-cs.com/media/wysiwyg/files/drawing/pue27acx4x0x.pdf
// The drawing specifies drills only. Copper rings are engineered 0.30 mm annuli.
export const usba_def = base_def
  .extend({
    fn: z.literal("usba"),
    num_pins: z.literal(4).default(4),
    tht: z.literal(true).default(true),
    smd: z.literal(false).default(false),
    pinstart: z.coerce.number().int().positive().default(1),
    reverse: z.boolean().default(false),
    p: positiveLength
      .default("2.5mm")
      .describe("pitch within each outer contact pair"),
    centerp: positiveLength
      .default("2mm")
      .describe("pitch between the two inner contacts"),
    id: positiveLength
      .default("0.92mm")
      .describe("electrical contact drill diameter"),
    ring: positiveLength
      .default("0.3mm")
      .describe("electrical contact annular ring"),
    shieldspan: positiveLength
      .default("13.14mm")
      .describe("shell mounting-hole center span"),
    shieldy: length
      .refine(Number.isFinite, "dimension must be finite")
      .default("-2.71mm")
      .describe("signed shell row offset from the contact row"),
    shieldid: positiveLength
      .default("2.3mm")
      .describe("shell mounting-hole drill diameter"),
    shieldring: positiveLength
      .default("0.3mm")
      .describe("shell mounting-hole annular ring"),
    w: positiveLength.default("13.1mm").describe("body width"),
    h: positiveLength
      .default("13.85mm")
      .describe("body length toward mating edge"),
    bodybottom: positiveLength
      .default("12.99mm")
      .describe("mating-edge distance from contact row"),
  })
  .superRefine((params, ctx) => {
    const od = params.id + 2 * params.ring
    if (od >= Math.min(params.p, params.centerp)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ring"],
        message: "contact lands must remain separate",
      })
    }
    if (params.shieldid + 2 * params.shieldring >= params.shieldspan) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["shieldring"],
        message: "shell mounting lands must remain separate",
      })
    }
    if (params.bodybottom > params.h) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["bodybottom"],
        message: "mating edge offset must fit within body length",
      })
    }
  })

export type UsbADef = z.input<typeof usba_def>

export const usba = (
  rawParams: UsbADef,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof usba_def>
} => {
  const parameters = usba_def.parse(rawParams)
  const {
    pinstart,
    reverse,
    p,
    centerp,
    id,
    ring,
    shieldspan,
    shieldy,
    shieldid,
    shieldring,
    w,
    h,
    bodybottom,
  } = parameters
  const clean = (value: number) => Number(value.toFixed(12))
  const od = clean(id + 2 * ring)
  const shieldod = clean(shieldid + 2 * shieldring)
  const innerX = centerp / 2
  const outerX = innerX + p
  const contactXs = [-outerX, -innerX, innerX, outerX]
  const contacts = contactXs.map((x, index) =>
    platedhole(pinstart + index, clean(reverse ? -x : x), 0, id, od),
  )
  const shellMounts = [
    platedhole(pinstart + 4, -shieldspan / 2, shieldy, shieldid, shieldod),
    platedhole(pinstart + 5, shieldspan / 2, shieldy, shieldid, shieldod),
  ]
  const bodyTop = clean(h - bodybottom)
  const clearance = shieldod / 2 + 0.2
  const sideSegments = [
    [-bodybottom, Math.min(bodyTop, shieldy - clearance)],
    [Math.max(-bodybottom, shieldy + clearance), bodyTop],
  ].filter(([start, end]) => end! > start!)
  const silkscreen = [
    silkscreenpath([
      { x: -w / 2, y: -bodybottom },
      { x: w / 2, y: -bodybottom },
    ]),
    silkscreenpath([
      { x: -w / 2, y: bodyTop },
      { x: w / 2, y: bodyTop },
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
    outerX + od / 2,
    shieldspan / 2 + shieldod / 2,
  )
  const top = Math.max(bodyTop, od / 2, shieldy + shieldod / 2) + 0.25
  const bottom = Math.min(-bodybottom, -od / 2, shieldy - shieldod / 2) - 0.25
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
      ...contacts,
      ...shellMounts,
      ...silkscreen,
      silkscreenRef(0, top + 0.55, 0.5),
      courtyard,
    ],
    parameters,
  }
}
