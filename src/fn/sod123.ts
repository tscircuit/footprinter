import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"
import { createFabricationNoteDiodeFromCopperPads } from "../helpers/create-fabrication-note-diode"

export const sod_def = base_def.extend({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("2.36mm"),
  h: z.string().default("1.22mm"),
  pl: z.string().default("0.9mm"),
  pw: z.string().default("1.2mm"),
  p: z.string().default("3.30mm"),
})

export const sod123 = (
  raw_params: z.input<typeof sod_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sod_def.parse(raw_params)
  const bodyHeight = length.parse(parameters.h)
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    bodyHeight / 4 + 0.4,
    0.3,
  )

  const courtyardWidthMm = 4.7
  const courtyardHeightMm = 2.3
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardWidthMm,
    height: courtyardHeightMm,
    layer: "top",
  }

  // Body outline. Every other member of the sod family draws one; sod123 was
  // the only one shipping bare pads. Derived from the pads rather than from
  // `h`, because `h` here is the body height (1.22mm) and the pads are taller
  // than that (1.2mm tall, so ±0.6) — placing the runs at ±h/2 would leave
  // 0.01mm and the stroke alone would put silk on copper.
  const padHalfLength = length.parse(parameters.pl) / 2
  const padHalfWidth = length.parse(parameters.pw) / 2
  const pitch = length.parse(parameters.p)
  const strokeWidth = 0.1
  const silkPadClearance = 0.2 + strokeWidth / 2

  const outlineHalfHeight = padHalfWidth + silkPadClearance
  // Left edge sits outboard of pad 1, marking the cathode end like KiCad's
  // D_SOD-123 does; the right side stays open so it never crosses pad 2.
  const outlineLeftX = -pitch / 2 - padHalfLength - silkPadClearance
  const outlineRightX = pitch / 2 - padHalfLength - silkPadClearance

  const silkscreenOutline: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: outlineRightX, y: outlineHalfHeight },
      { x: outlineLeftX, y: outlineHalfHeight },
      { x: outlineLeftX, y: -outlineHalfHeight },
      { x: outlineRightX, y: -outlineHalfHeight },
    ],
    stroke_width: strokeWidth,
  }

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      ...createFabricationNoteDiodeFromCopperPads(parameters),
      silkscreenOutline as AnyCircuitElement,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ),
    parameters,
  }
}

export const getSodCoords = (parameters: {
  pn: number
  p: number
}) => {
  const { pn, p } = parameters

  if (pn === 1) {
    return { x: -p / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: p / 2, y: 0 }
  }
}

export const sodWithoutParsing = (parameters: z.infer<typeof sod_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      p: Number.parseFloat(parameters.p),
    })
    pads.push(
      rectpad(
        i,
        x,
        y,
        Number.parseFloat(parameters.pl),
        Number.parseFloat(parameters.pw),
        0.1125,
      ),
    )
  }
  return pads
}
