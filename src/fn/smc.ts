import type { AnySoupElement, PcbSilkscreenPath } from "circuit-json"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { length } from "circuit-json"

export const smc_def = z.object({
  fn: z.string(),
  num_pins: z.literal(2).default(2),
  w: z.string().default("10.70mm"),
  h: z.string().default("6.60mm"),
  pl: z.string().default("3.30mm"),
  pw: z.string().default("2.50mm"),
  p: z.string().default("6.80mm"),
})

export const smc = (
  raw_params: z.input<typeof smc_def>,
): { circuitJson: AnySoupElement[]; parameters: any } => {
  const parameters = smc_def.parse(raw_params)

  // Define silkscreen reference text
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    length.parse(parameters.h) - 0.5,
    0.3,
  )

  const silkscreenLine: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      {
        x: length.parse(parameters.p) / 2,
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
        x: length.parse(parameters.p) / 2,
        y: -length.parse(parameters.h) / 2,
      },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  return {
    circuitJson: smcWithoutParsing(parameters).concat(
      silkscreenLine as AnySoupElement,
      silkscreenRefText as AnySoupElement,
    ),
    parameters,
  }
}

// Get coordinates for smc pads
export const getSmcCoords = (parameters: {
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

// Function to generate smc pads
export const smcWithoutParsing = (parameters: z.infer<typeof smc_def>) => {
  const pads: AnySoupElement[] = []

  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = getSmcCoords({
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
