import type { AnyCircuitElement } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { length } from "circuit-json"
import { z } from "zod"
import { to220 } from "./to220"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { platedHolePill } from "../helpers/platedHolePill"
import { base_def } from "../helpers/zod/base_def"

// TO-220F uses 2.54mm standard pitch to match KiCad
const TO220F_PITCH_MM = 2.54

export const to220f_def = base_def.extend({
  fn: z.string(),
  // KiCad TO-220F-3_Vertical: hole=1.2mm, pad=1.905×2.0mm, pitch=2.54mm
  id: length.optional().default("1.2mm"),
  od: length.optional().default("1.905mm"),
  ph: length.optional().default("2mm"),
  w: length.optional().default("13mm"),
  h: length.optional().default("7mm"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
})

export type To220fDef = z.input<typeof to220f_def>

export const to220f = (
  raw_params: To220fDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220f_def.parse(raw_params)

  const numPins =
    parameters.num_pins ??
    Number.parseInt(
      parameters.string?.match(/^to220f(?:_|-)(\d+)/i)?.[1] ?? "3",
      10,
    )

  // Get silkscreen and other non-hole elements from to220
  const baseResult = to220({
    ...parameters,
    fn: "to220",
    string: parameters.string?.replace(/^to220f/i, "to220"),
    num_pins: numPins,
  })

  // Compute exact hole positions at standard 2.54mm pitch (centered at x=0)
  const holeY = -1
  const newHoles: AnyCircuitElement[] = Array.from(
    { length: numPins },
    (_, i) => {
      const x =
        numPins % 2 === 0
          ? (i - numPins / 2 + 0.5) * TO220F_PITCH_MM
          : (i - Math.floor(numPins / 2)) * TO220F_PITCH_MM

      if (i === 0) {
        // Pin 1: rectangular pad with circular drill (matches KiCad TO-220F-3)
        return platedHoleWithRectPad({
          pn: 1,
          x,
          y: holeY,
          holeDiameter: parameters.id,
          rectPadWidth: parameters.od,
          rectPadHeight: parameters.ph,
        }) as AnyCircuitElement
      }

      // Pins 2/3: pill pads with circular drill (matches KiCad TO-220F-3)
      return platedHolePill(
        i + 1,
        x,
        holeY,
        mm(parameters.id),
        mm(parameters.od),
        mm(parameters.ph),
      ) as AnyCircuitElement
    },
  )

  // Replace plated holes in base result with our corrected ones
  const nonHoleElements = baseResult.circuitJson.filter(
    (e: any) => e.type !== "pcb_plated_hole",
  )

  return {
    circuitJson: [...newHoles, ...nonHoleElements],
    parameters: { ...parameters, p: TO220F_PITCH_MM, num_pins: numPins },
  }
}
