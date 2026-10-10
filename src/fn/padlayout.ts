import { z } from "zod"
import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardRect,
  type PcbFabricationNoteRect,
  type PcbHoleCircle,
  type PcbPlatedHole,
} from "circuit-json"
import { circlepad } from "../helpers/circlepad"
import { platedhole } from "../helpers/platedhole"
import { polygonpad } from "../helpers/polygonpad"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

type Length = string | number
type Pin = string | number

/** Each tuple describes one land in PCB top-view coordinates. */
export type PadLayoutSmdPad = [
  pin: Pin,
  x: Length,
  y: Length,
  width: Length,
  height: Length,
]
export type PadLayoutCirclePad = [
  pin: Pin,
  x: Length,
  y: Length,
  diameter: Length,
]
export type PadLayoutRing = [
  pin: Pin,
  x: Length,
  y: Length,
  outerDiameter: Length,
  innerDiameter: Length,
]
export type PadLayoutHole = [x: Length, y: Length, diameter: Length]
export type PadLayoutPlatedHole = [
  pin: Pin,
  shape: "circle" | "pill" | "oval",
  x: Length,
  y: Length,
  holeWidth: Length,
  holeHeight: Length,
  outerWidth: Length,
  outerHeight: Length,
]

const coordinate = length.refine(Number.isFinite, "coordinate must be finite")
const size = length.refine(
  (value) => Number.isFinite(value) && value > 0,
  "dimension must be finite and positive",
)
const pin = z
  .union([z.number().int().positive().finite(), z.string().trim().min(1)])
  .transform(String)

// Semicolons separate lands; commas separate fields. Nested arrays provide the
// same interface to the typed builder without serializing coordinates first.
const tupleList = <T extends z.ZodTypeAny>(tuple: T) =>
  z.preprocess((value) => {
    if (typeof value !== "string") return value
    let contents = value.trim()
    if (contents.startsWith("(") && contents.endsWith(")")) {
      contents = contents.slice(1, -1)
    }
    return contents.split(";").map((row) => row.split(",").map((v) => v.trim()))
  }, z.array(tuple).min(1))

const smdPads = tupleList(z.tuple([pin, coordinate, coordinate, size, size]))
const circlePads = tupleList(z.tuple([pin, coordinate, coordinate, size]))
const holes = tupleList(z.tuple([coordinate, coordinate, size]))
const rings = tupleList(
  z
    .tuple([pin, coordinate, coordinate, size, size])
    .refine(
      ([, , , outer, inner]) => outer > inner,
      "ring outer diameter must exceed its inner diameter",
    ),
)
const platedHoles = tupleList(
  z
    .tuple([
      pin,
      z.enum(["circle", "pill", "oval"]),
      coordinate,
      coordinate,
      size,
      size,
      size,
      size,
    ])
    .superRefine(([, shape, , , hw, hh, ow, oh], ctx) => {
      if (ow <= hw || oh <= hh) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "plated hole copper must extend beyond the aperture",
        })
      }
      if (shape === "circle" && (hw !== hh || ow !== oh)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "circle hole and copper widths must equal their heights",
        })
      }
    }),
)

export const padlayout_def = base_def
  .extend({
    fn: z.literal("padlayout"),
    smdpads: smdPads.optional(),
    circlepads: circlePads.optional(),
    rings: rings.optional(),
    holes: holes.optional(),
    platedholes: platedHoles.optional(),
    bodywidth: size.optional(),
    bodyheight: size.optional(),
    bodyx: coordinate.default(0),
    bodyy: coordinate.default(0),
  })
  .superRefine((value, ctx) => {
    if (
      !value.smdpads &&
      !value.circlepads &&
      !value.rings &&
      !value.platedholes
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "padlayout requires at least one copper land",
      })
    }
    if ((value.bodywidth === undefined) !== (value.bodyheight === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "bodywidth and bodyheight must be specified together",
      })
    }
  })

// Four simple polygons form one connected annulus. They have no copper at the
// center and do not rely on SVG fill rules or a drilled hole to remove copper.
// 128 chords keep the maximum radial approximation error below 0.00031 * OD.
const ringPads = (pn: string, x: number, y: number, od: number, id: number) => {
  const steps = 32
  return Array.from({ length: 4 }, (_, quadrant) => {
    const point = (index: number, radius: number) => {
      const angle = ((quadrant + index / steps) * Math.PI) / 2
      return {
        x: x + radius * Math.cos(angle),
        y: y + radius * Math.sin(angle),
      }
    }
    const outer = Array.from({ length: steps + 1 }, (_, i) => point(i, od / 2))
    const inner = Array.from({ length: steps + 1 }, (_, i) =>
      point(steps - i, id / 2),
    )
    return polygonpad([pn], [...outer, ...inner])
  })
}

export const padlayout = (
  rawParams: z.input<typeof padlayout_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: z.output<typeof padlayout_def>
} => {
  const parameters = padlayout_def.parse(rawParams)
  const elements: AnyCircuitElement[] = []
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  const bounds = (x: number, y: number, width: number, height: number) => {
    minX = Math.min(minX, x - width / 2)
    minY = Math.min(minY, y - height / 2)
    maxX = Math.max(maxX, x + width / 2)
    maxY = Math.max(maxY, y + height / 2)
  }

  for (const [pn, x, y, width, height] of parameters.smdpads ?? []) {
    elements.push(rectpad([pn], x, y, width, height))
    bounds(x, y, width, height)
  }
  for (const [pn, x, y, diameter] of parameters.circlepads ?? []) {
    elements.push(circlepad([pn], { x, y, radius: diameter / 2 }))
    bounds(x, y, diameter, diameter)
  }
  for (const [pn, x, y, od, id] of parameters.rings ?? []) {
    elements.push(...ringPads(pn, x, y, od, id))
    bounds(x, y, od, od)
  }
  for (const [x, y, diameter] of parameters.holes ?? []) {
    const hole: PcbHoleCircle = {
      type: "pcb_hole",
      pcb_hole_id: "",
      pcb_component_id: "",
      hole_shape: "circle",
      x,
      y,
      hole_diameter: diameter,
    }
    elements.push(hole)
    bounds(x, y, diameter, diameter)
  }
  for (const [pn, shape, x, y, hw, hh, ow, oh] of parameters.platedholes ??
    []) {
    const hole: PcbPlatedHole =
      shape === "circle"
        ? { ...platedhole(1, x, y, hw, ow), port_hints: [pn] }
        : {
            type: "pcb_plated_hole",
            pcb_plated_hole_id: "",
            pcb_component_id: "",
            pcb_port_id: "",
            port_hints: [pn],
            shape,
            x,
            y,
            hole_width: hw,
            hole_height: hh,
            outer_width: ow,
            outer_height: oh,
            ccw_rotation: 0,
            layers: ["top", "bottom"],
          }
    elements.push(hole)
    bounds(x, y, ow, oh)
  }
  const { bodywidth, bodyheight, bodyx, bodyy } = parameters
  if (bodywidth !== undefined && bodyheight !== undefined) {
    const body: PcbFabricationNoteRect = {
      type: "pcb_fabrication_note_rect",
      pcb_fabrication_note_rect_id: "",
      pcb_component_id: "",
      center: { x: bodyx, y: bodyy },
      width: bodywidth,
      height: bodyheight,
      stroke_width: 0.1,
      layer: "top",
      is_filled: false,
    }
    elements.push(body)
    bounds(bodyx, bodyy, bodywidth, bodyheight)
  }
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: (minX + maxX) / 2, y: (minY + maxY) / 2 },
    width: maxX - minX + 0.5,
    height: maxY - minY + 0.5,
    layer: "top",
  }
  elements.push(courtyard, silkscreenRef(courtyard.center.x, maxY + 0.8, 0.4))
  return { circuitJson: elements, parameters }
}
