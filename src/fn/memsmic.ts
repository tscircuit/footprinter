import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardOutline,
  type PcbSilkscreenPath,
  type PcbSmtPad,
} from "circuit-json"
import { z } from "zod"
import { annularpad } from "../helpers/annularpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

// Profiles define manufacturer physical terminal placement, not signal names.
// Changing a profile's dimensions does not imply compatibility with another MPN.
const profiles = {
  ics43434: {
    num_pins: 6,
    bodywidth: 2.65,
    bodyheight: 3.5,
    p: 0.9,
    py: 0.822,
    pw: 0.6,
    ph: 0.522,
    rowoffsety: -1.364,
    portoffsetx: 0,
    portoffsety: 0.71,
    id: 1.025,
    od: 1.625,
    holed: 0.5,
    ringPin: 3,
    rows: [
      { pins: [5, 6, 1], columns: [-1, 0, 1], row: 0 },
      { pins: [4, 2], columns: [-1, 1], row: 1 },
    ],
  },
  ics43432: {
    num_pins: 7,
    bodywidth: 3,
    bodyheight: 4,
    p: 2.15,
    py: 0.65,
    pw: 0.6,
    ph: 0.4,
    rowoffsety: -1.675,
    portoffsetx: 0,
    portoffsety: 0.9,
    id: 1.05,
    od: 1.65,
    holed: 0.5,
    ringPin: 4,
    rows: [
      { pins: [7, 1], columns: [-0.5, 0.5], row: 0 },
      { pins: [6, 2], columns: [-0.5, 0.5], row: 1 },
      { pins: [5, 3], columns: [-0.5, 0.5], row: 2 },
    ],
  },
} as const

export type MemsmicProfile = keyof typeof profiles
export type MemsmicOptionKey =
  | "profile"
  | "bodywidth"
  | "bodyheight"
  | "p"
  | "py"
  | "pw"
  | "ph"
  | "rowoffsety"
  | "portoffsetx"
  | "portoffsety"
  | "id"
  | "od"
  | "holed"

const positiveLength = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "must be a positive finite length",
)
const finiteOffset = length.refine(Number.isFinite, "offset must be finite")
const profile = z.preprocess(
  (value) =>
    typeof value === "string" ? value.replace(/^\((.*)\)$/, "$1") : value,
  z.enum(["ics43434", "ics43432"]),
)

export const memsmic_def = base_def
  .extend({
    fn: z.literal("memsmic"),
    profile,
    num_pins: z.number().int().positive().optional(),
    bodywidth: positiveLength.optional().describe("package body X size"),
    bodyheight: positiveLength.optional().describe("package body Y size"),
    p: positiveLength.optional().describe("horizontal land center pitch"),
    py: positiveLength.optional().describe("vertical land row pitch"),
    pw: positiveLength.optional().describe("rectangular land X dimension"),
    ph: positiveLength.optional().describe("rectangular land Y dimension"),
    rowoffsety: finiteOffset.optional().describe("lowest land row Y center"),
    portoffsetx: finiteOffset.optional().describe("sound port X center"),
    portoffsety: finiteOffset.optional().describe("sound port Y center"),
    id: positiveLength
      .optional()
      .describe("ground ring copper opening diameter"),
    od: positiveLength
      .optional()
      .describe("ground ring copper outside diameter"),
    holed: positiveLength
      .optional()
      .describe(
        "concentric unplated sound opening; defaults to profile minimum",
      ),
    origin: z
      .enum([
        "center",
        "bottomleft",
        "pin1",
        "bottomcenter",
        "centerbottom",
        "topcenter",
        "centertop",
        "leftcenter",
        "centerleft",
        "rightcenter",
        "centerright",
      ])
      .optional(),
  })
  .transform((parameters, context) => {
    const mechanicalProfile = profiles[parameters.profile]
    if (
      parameters.num_pins !== undefined &&
      parameters.num_pins !== mechanicalProfile.num_pins
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["num_pins"],
        message: `MEMS microphone profile ${parameters.profile} requires ${mechanicalProfile.num_pins} physical terminals, including its ground ring`,
      })
      return z.NEVER
    }
    return {
      ...parameters,
      num_pins: mechanicalProfile.num_pins,
      bodywidth: parameters.bodywidth ?? mechanicalProfile.bodywidth,
      bodyheight: parameters.bodyheight ?? mechanicalProfile.bodyheight,
      p: parameters.p ?? mechanicalProfile.p,
      py: parameters.py ?? mechanicalProfile.py,
      pw: parameters.pw ?? mechanicalProfile.pw,
      ph: parameters.ph ?? mechanicalProfile.ph,
      rowoffsety: parameters.rowoffsety ?? mechanicalProfile.rowoffsety,
      portoffsetx: parameters.portoffsetx ?? mechanicalProfile.portoffsetx,
      portoffsety: parameters.portoffsety ?? mechanicalProfile.portoffsety,
      id: parameters.id ?? mechanicalProfile.id,
      od: parameters.od ?? mechanicalProfile.od,
      holed: parameters.holed ?? mechanicalProfile.holed,
    }
  })
  .superRefine((parameters, context) => {
    if (parameters.id >= parameters.od) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["id"],
        message:
          "Ground ring inner diameter must be smaller than outer diameter",
      })
    }
    if (parameters.holed < profiles[parameters.profile].holed) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["holed"],
        message:
          "Unplated sound opening must meet the profile minimum diameter",
      })
    }
    if (parameters.holed >= parameters.id * Math.cos(Math.PI / 128)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["holed"],
        message: "Unplated sound opening must clear the ground ring copper",
      })
    }
  })

export type MemsmicInput = z.input<typeof memsmic_def>

export const memsmic = (
  rawParameters: MemsmicInput,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof memsmic_def>
} => {
  const parameters = memsmic_def.parse(rawParameters)
  const mechanicalProfile = profiles[parameters.profile]
  type RectangularLand = PcbSmtPad & {
    shape: "rect"
    x: number
    y: number
    width: number
    height: number
  }
  const rectangles: RectangularLand[] = []
  for (const row of mechanicalProfile.rows) {
    for (const [index, pin] of row.pins.entries()) {
      rectangles.push(
        rectpad(
          pin,
          row.columns[index]! * parameters.p,
          parameters.rowoffsety + row.row * parameters.py,
          parameters.pw,
          parameters.ph,
        ) as RectangularLand,
      )
    }
  }

  // Copper dimensions are independent of the acoustic drill. Separate physical
  // contacts must clear one another and the continuous ground ring.
  for (const [index, rectangle] of rectangles.entries()) {
    for (const other of rectangles.slice(index + 1)) {
      if (
        Math.abs(rectangle.x - other.x) <= parameters.pw &&
        Math.abs(rectangle.y - other.y) <= parameters.ph
      ) {
        throw new Error(
          "MEMS microphone lands for different contacts must not touch or overlap",
        )
      }
    }
    const dx = Math.abs(rectangle.x - parameters.portoffsetx)
    const dy = Math.abs(rectangle.y - parameters.portoffsety)
    const nearest = Math.hypot(
      Math.max(dx - parameters.pw / 2, 0),
      Math.max(dy - parameters.ph / 2, 0),
    )
    const farthest = Math.hypot(dx + parameters.pw / 2, dy + parameters.ph / 2)
    if (
      nearest <= parameters.od / 2 &&
      farthest >= (parameters.id / 2) * Math.cos(Math.PI / 128)
    ) {
      throw new Error("MEMS microphone lands must clear the ground ring copper")
    }
    if (nearest <= parameters.holed / 2) {
      throw new Error(
        "MEMS microphone lands must clear the unplated sound opening",
      )
    }
  }

  const ring = annularpad(
    mechanicalProfile.ringPin,
    parameters.portoffsetx,
    parameters.portoffsety,
    parameters.id,
    parameters.od,
  )
  const copperHalfWidth = Math.max(
    ...rectangles.map((pad) => Math.abs(pad.x) + parameters.pw / 2),
    Math.abs(parameters.portoffsetx) + parameters.od / 2,
  )
  const copperHalfHeight = Math.max(
    ...rectangles.map((pad) => Math.abs(pad.y) + parameters.ph / 2),
    Math.abs(parameters.portoffsety) + parameters.od / 2,
  )
  const halfWidth = Math.max(parameters.bodywidth / 2, copperHalfWidth)
  const halfHeight = Math.max(parameters.bodyheight / 2, copperHalfHeight)
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    layer: "top",
    outline: [
      { x: -halfWidth - 0.25, y: -halfHeight - 0.25 },
      { x: halfWidth + 0.25, y: -halfHeight - 0.25 },
      { x: halfWidth + 0.25, y: halfHeight + 0.25 },
      { x: -halfWidth - 0.25, y: halfHeight + 0.25 },
      { x: -halfWidth - 0.25, y: -halfHeight - 0.25 },
    ],
  }
  const pin1 = rectangles.find((pad) => pad.port_hints?.[0] === "1")!
  const xSign = pin1.x < 0 ? -1 : 1
  const ySign = pin1.y < 0 ? -1 : 1
  const marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "pin1_marker",
    pcb_component_id: "",
    layer: "top",
    stroke_width: 0.1,
    route: [
      { x: xSign * (halfWidth + 0.15), y: ySign * (halfHeight - 0.15) },
      { x: xSign * (halfWidth + 0.15), y: ySign * (halfHeight + 0.15) },
      { x: xSign * (halfWidth - 0.15), y: ySign * (halfHeight + 0.15) },
    ],
  }

  return {
    circuitJson: [
      ...rectangles,
      ...ring,
      {
        type: "pcb_hole" as const,
        pcb_hole_id: "sound_opening",
        pcb_component_id: "",
        hole_shape: "circle" as const,
        hole_diameter: parameters.holed,
        x: parameters.portoffsetx,
        y: parameters.portoffsety,
      },
      marker,
      silkscreenRef(0, halfHeight + 0.65, 0.3),
      courtyard,
    ],
    parameters,
  }
}
