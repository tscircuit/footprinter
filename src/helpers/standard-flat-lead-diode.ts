import {
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { z } from "zod"
import { createFabricationNoteDiodeFromCircuitJson } from "./create-fabrication-note-diode"
import { rectpad } from "./rectpad"
import { silkscreenRef } from "./silkscreenRef"
import { base_def } from "./zod/base_def"

export type StandardFlatLeadDiodeDefaults = {
  p: string
  pw: string
  ph: string
  bodylength: string
  bodywidth: string
  bodyheight: string
  leadspan: string
  cathodelength: string
  cathodewidth: string
  anodelength: string
  anodewidth: string
  terminalthickness: string
  standoff: string
  taperinset: string
  markingwidth: string
}

const positiveLength = length.refine((value) => value > 0, {
  message: "dimension must be positive",
})
const nonnegativeLength = length.refine((value) => value >= 0, {
  message: "dimension must be non-negative",
})
const diodePin = z.coerce.number().pipe(z.union([z.literal(1), z.literal(2)]))

/**
 * Defines a named two-lead standard package. Land-pattern dimensions (`p`,
 * `pw`, and `ph`) remain independent of the mechanical dimensions consumed by
 * 3D renderers.
 */
export const createStandardFlatLeadDiodeDef = <const TName extends string>(
  name: TName,
  defaults: StandardFlatLeadDiodeDefaults,
) =>
  base_def
    .extend({
      [name]: z.literal(true).optional(),
      fn: z.literal(name),
      string: z.string().optional(),
      origin: z.string().optional(),
      num_pins: z.literal(2).default(2),
      p: positiveLength
        .default(length.parse(defaults.p))
        .describe("pad center-to-center pitch"),
      pw: positiveLength
        .default(length.parse(defaults.pw))
        .describe("pad size along the package length"),
      ph: positiveLength
        .default(length.parse(defaults.ph))
        .describe("pad size along the package width"),
      cyw: positiveLength.optional().describe("courtyard width"),
      cyh: positiveLength.optional().describe("courtyard height"),
      bodylength: positiveLength.default(length.parse(defaults.bodylength)),
      bodywidth: positiveLength.default(length.parse(defaults.bodywidth)),
      bodyheight: positiveLength.default(length.parse(defaults.bodyheight)),
      leadspan: positiveLength.default(length.parse(defaults.leadspan)),
      cathodelength: positiveLength.default(
        length.parse(defaults.cathodelength),
      ),
      cathodewidth: positiveLength.default(length.parse(defaults.cathodewidth)),
      anodelength: positiveLength.default(length.parse(defaults.anodelength)),
      anodewidth: positiveLength.default(length.parse(defaults.anodewidth)),
      terminalthickness: positiveLength.default(
        length.parse(defaults.terminalthickness),
      ),
      standoff: nonnegativeLength.default(length.parse(defaults.standoff)),
      taperinset: nonnegativeLength.default(length.parse(defaults.taperinset)),
      markingwidth: nonnegativeLength.default(
        length.parse(defaults.markingwidth),
      ),
      cathodepin: diodePin.default(1),
      anodepin: diodePin.default(2),
    })
    .strict()
    .superRefine((parameters, ctx) => {
      if (parameters.cathodepin === parameters.anodepin) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "anode and cathode must use different pins",
          path: ["cathodepin"],
        })
      }
      if (parameters.bodyheight <= parameters.standoff) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "bodyheight must be greater than standoff",
          path: ["bodyheight"],
        })
      }
      if (parameters.terminalthickness > parameters.bodyheight) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "terminalthickness must not exceed bodyheight",
          path: ["terminalthickness"],
        })
      }
      if (parameters.leadspan < parameters.bodylength) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "leadspan must be at least bodylength",
          path: ["leadspan"],
        })
      }
      if (
        parameters.taperinset * 2 >=
        Math.min(parameters.bodylength, parameters.bodywidth)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "taperinset is too large for the body dimensions",
          path: ["taperinset"],
        })
      }
      if (parameters.markingwidth > parameters.bodylength) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "markingwidth must not exceed bodylength",
          path: ["markingwidth"],
        })
      }
    })
    .transform((parameters) => {
      const {
        [name]: _selector,
        string: _string,
        ...publicParameters
      } = parameters
      return publicParameters
    })

type StandardFlatLeadDiodeParameters = {
  num_pins: 2
  p: number
  pw: number
  ph: number
  cyw?: number
  cyh?: number
  bodylength: number
  bodywidth: number
  cathodepin: 1 | 2
  anodepin: 1 | 2
}

export const createStandardFlatLeadDiodeCircuitJson = (
  parameters: StandardFlatLeadDiodeParameters,
): AnyCircuitElement[] => {
  const pads = [
    rectpad(1, -parameters.p / 2, 0, parameters.pw, parameters.ph),
    rectpad(2, parameters.p / 2, 0, parameters.pw, parameters.ph),
  ]
  const bodyHalfLength = parameters.bodylength / 2
  const bodyHalfWidth = parameters.bodywidth / 2
  const silkscreen: PcbSilkscreenPath[] = [bodyHalfWidth, -bodyHalfWidth].map(
    (y, index) => ({
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: `flat_lead_body_${index}`,
      pcb_component_id: "",
      layer: "top",
      stroke_width: 0.1,
      route: [
        { x: -bodyHalfLength, y },
        { x: bodyHalfLength, y },
      ],
    }),
  )
  const copperHalfLength = parameters.p / 2 + parameters.pw / 2
  const courtyardWidth =
    parameters.cyw ?? Math.max(copperHalfLength, bodyHalfLength) * 2 + 0.5
  const courtyardHeight =
    parameters.cyh ?? Math.max(parameters.ph / 2, bodyHalfWidth) * 2 + 0.5
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardWidth,
    height: courtyardHeight,
    layer: "top",
  }

  return [
    ...pads,
    ...createFabricationNoteDiodeFromCircuitJson(pads, {
      cathodePin: parameters.cathodepin,
      anodePin: parameters.anodepin,
    }),
    ...silkscreen,
    silkscreenRef(0, courtyardHeight / 2 + 0.4, 0.3),
    courtyard,
  ]
}
