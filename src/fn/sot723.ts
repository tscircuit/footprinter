import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardOutline,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

export const sot723_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(3).default(3),
  w: z.string().default("1.2mm"),
  h: z.string().default("1.2mm"),
  pw: z.string().default("0.40mm"),
  pl: z.string().default("0.45mm"),
  p: z.string().default("0.575mm"),
})

export const sot723 = (
  raw_params: z.input<typeof sot723_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sot723_def.parse(raw_params)
  const pad = sot723WithoutParsing(parameters)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.2,
  )

  const courtyardWidthMm = 1.8
  const courtyardHeightMm = 1.8
  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: [
      { x: -courtyardWidthMm / 2, y: courtyardHeightMm / 2 },
      { x: courtyardWidthMm / 2, y: courtyardHeightMm / 2 },
      { x: courtyardWidthMm / 2, y: -courtyardHeightMm / 2 },
      { x: -courtyardWidthMm / 2, y: -courtyardHeightMm / 2 },
    ],
    layer: "top",
  }

  // Body outline. Every sibling SOT draws one; sot723 shipped bare pads.
  // The pads reach past the body on both sides, so this emits the two runs
  // that clear copper (above pin 1 / below pin 2) rather than a closed box,
  // which is what KiCad's SOT-723 does.
  const padHalfWidth = length.parse(parameters.pw) / 2
  const padHalfLength = length.parse(parameters.pl) / 2
  const pitch = length.parse(parameters.p)
  const strokeWidth = 0.1
  const silkPadClearance = 0.2 + strokeWidth / 2

  // Take the pad extents from the coordinate function rather than assuming
  // them, so the outline follows if the geometry is ever parameterised.
  const padCoords = [1, 2, 3].map((pn) =>
    getCcwSot723Coords({
      num_pins: parameters.num_pins,
      pn,
      w: length.parse(parameters.w),
      h: length.parse(parameters.h),
      pl: length.parse(parameters.pl),
      p: pitch,
    }),
  )
  const padOuterY =
    Math.max(...padCoords.map((c) => Math.abs(c.y))) + padHalfWidth
  const runY = padOuterY + silkPadClearance
  // The runs sit clear of every pad vertically, so they span the body width.
  // Clamp anyway against any pad that does reach into the run's y band, so the
  // outline stays correct if the geometry is ever parameterised differently.
  const bodyHalfWidth = length.parse(parameters.w) / 2
  let runHalfX = bodyHalfWidth
  for (const coord of padCoords) {
    const padTop = coord.y + padHalfWidth + silkPadClearance
    const padBottom = coord.y - padHalfWidth - silkPadClearance
    // `>=` so a run that only grazes the clearance boundary — which is exactly
    // where `runY` lands for the outermost pad — isn't treated as a collision.
    if (runY >= padTop || runY <= padBottom) continue
    runHalfX = Math.min(
      runHalfX,
      Math.max(0, Math.abs(coord.x) - padHalfLength - silkPadClearance),
    )
  }

  const silkPath = (id: string, y: number): PcbSilkscreenPath => ({
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: id,
    route: [
      { x: -runHalfX, y },
      { x: runHalfX, y },
    ],
    stroke_width: strokeWidth,
  })

  return {
    circuitJson: [
      ...pad,
      silkPath("silkscreen_path_top", runY) as AnyCircuitElement,
      silkPath("silkscreen_path_bottom", -runY) as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard,
    ],
    parameters,
  }
}

export const getCcwSot723Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: p, y: 0 }
  }
  if (pn === 2) {
    return { x: -p, y: -0.4 }
  }
  return { x: -p, y: 0.4 }
}

export const sot723WithoutParsing = (
  parameters: z.infer<typeof sot723_def>,
) => {
  const pads: AnyCircuitElement[] = []
  const w = Number.parseFloat(parameters.w)
  const h = Number.parseFloat(parameters.h)
  const pl = Number.parseFloat(parameters.pl)
  const pw = Number.parseFloat(parameters.pw)
  const p = Number.parseFloat(parameters.p)
  const cornerRadius = Math.min(pl, pw) / 8

  for (let i = 0; i < 3; i++) {
    const { x, y } = getCcwSot723Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w,
      h,
      pl,
      p,
    })
    pads.push(rectpad(i + 1, x, y, pl, pw, cornerRadius))
  }

  return pads
}
