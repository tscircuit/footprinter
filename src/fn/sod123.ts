import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbFabricationNotePath,
  PcbFabricationNoteText,
} from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"
import { base_def } from "../helpers/zod/base_def"

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

  const fabricationPaths: PcbFabricationNotePath[] = [
    [{ x: 0.25, y: 0 }, { x: 0.75, y: 0 }],
    [{ x: 0.25, y: 0.4 }, { x: -0.35, y: 0 }],
    [{ x: 0.25, y: -0.4 }, { x: 0.25, y: 0.4 }],
    [{ x: -0.35, y: 0 }, { x: 0.25, y: -0.4 }],
    [{ x: -0.35, y: 0 }, { x: -0.35, y: 0.55 }],
    [{ x: -0.35, y: 0 }, { x: -0.35, y: -0.55 }],
    [{ x: -0.75, y: 0 }, { x: -0.35, y: 0 }],
    [{ x: -1.4, y: 0.9 }, { x: -1.4, y: -0.9 }],
    [{ x: 1.4, y: 0.9 }, { x: -1.4, y: 0.9 }],
    [{ x: 1.4, y: -0.9 }, { x: 1.4, y: 0.9 }],
    [{ x: -1.4, y: -0.9 }, { x: 1.4, y: -0.9 }],
  ].map((route, index) => ({
    type: "pcb_fabrication_note_path",
    pcb_fabrication_note_path_id: `sod123_fab_path_${index}`,
    pcb_component_id: "",
    layer: "top",
    route,
    stroke_width: 0.1,
  }))

  // Match KiCad D_SOD-123 F.Fab texts:
  const fabricationValueText: PcbFabricationNoteText = {
    type: "pcb_fabrication_note_text",
    pcb_fabrication_note_text_id: "sod123_fab_value",
    font: "tscircuit2024",
    font_size: 1,
    pcb_component_id: "",
    text: "D_SOD-123",
    layer: "top",
    anchor_position: { x: 0, y: -2 },
    anchor_alignment: "center",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) / 4 + 0.4,
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

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      ...fabricationPaths,
      fabricationValueText as AnyCircuitElement,
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
      ),
    )
  }
  return pads
}
