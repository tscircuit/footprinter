import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const melf_def = z.object({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("7.0mm"),
  h: z.string().default("3.35mm"),
  pl: z.string().default("1.50mm"),
  pw: z.string().default("2.70mm"),
  pad_spacing: z.string().default("4.8mm"),
})

export const melf = (
  raw_params: z.input<typeof melf_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = melf_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h),
    0.3,
  )

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2,
        y: length.parse(parameters.h) / 2,
      },
      {
        x: -length.parse(parameters.w) / 2,
        y: -length.parse(parameters.h) / 2,
      },
      {
        x: length.parse(parameters.pad_spacing) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: sodWithoutParsing(parameters).concat(
      silkscreenLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

export const getSodCoords = (parameters: {
  pn: number
  pad_spacing: number
}) => {
  const { pn, pad_spacing } = parameters

  if (pn === 1) {
    return { x: -pad_spacing / 2, y: 0 }
    // biome-ignore lint/style/noUselessElse: <explanation>
  } else {
    return { x: pad_spacing / 2, y: 0 }
  }
}

export const sodWithoutParsing = (parameters: z.infer<typeof melf_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSodCoords({
      pn: i,
      pad_spacing: Number.parseFloat(parameters.pad_spacing),
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
