import type { AnyCircuitElement } from "circuit-json"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"

/**
 * UTDFN-4-EP (1x1) footprint
 *
 * References (JLCPCB part pages):
 * - Microchip MIC5366-1.8YMT-TZ (UTDFN-4-EP 1x1): https://jlcpcb.com/partdetail/MIC5366-1.8YMT-TZ/C621364
 * - Fitipower FP6182-28X7 (UTDFN-4-EP 1x1): https://jlcpcb.com/partdetail/FP6182-28X7/C498349
 * Recommended land pattern per Microchip datasheet:
 * - https://ww1.microchip.com/downloads/en/DeviceDoc/MIC5366-1.8YMT-TZ-DS20005619G.pdf (page 11)
 */
export const utdfn4ep_def = z.object({
 
  origin: z.string().optional(),
 
  norefdes: z.boolean().optional(),
  
  faceup: z.boolean().optional(),
  
  pad_w: z.number().optional(),
  pad_h: z.number().optional(),
  ep_w: z.number().optional(),
  ep_h: z.number().optional(),
  inset: z.number().optional(),
})

export const utdfn4ep = (
  raw_params: z.input<typeof utdfn4ep_def> | undefined,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn4ep_def.parse(raw_params ?? {})

  
  const body_w = 1.0
  const body_h = 1.0

 
  const pad_w = parameters.pad_w ?? 0.40
  const pad_h = parameters.pad_h ?? 0.48
  const ep_w = parameters.ep_w ?? 0.47
  const ep_h = parameters.ep_h ?? 0.22
  const inset = parameters.inset ?? 0.05

  const half_body_w = body_w / 2
  const half_body_h = body_h / 2

  const pads: AnyCircuitElement[] = []

  // Bottom-left (pin 1)
  const bl_x = - (half_body_w - pad_w / 2 - inset)
  const bl_y = - (half_body_h - pad_h / 2 - inset)
  pads.push(rectpad(1, bl_x, bl_y, pad_w, pad_h))

  // Bottom-right (pin 2)
  const br_x = + (half_body_w - pad_w / 2 - inset)
  const br_y = - (half_body_h - pad_h / 2 - inset)
  pads.push(rectpad(2, br_x, br_y, pad_w, pad_h))

  // Top-right (pin 3)
  const tr_x = + (half_body_w - pad_w / 2 - inset)
  const tr_y = + (half_body_h - pad_h / 2 - inset)
  pads.push(rectpad(3, tr_x, tr_y, pad_w, pad_h))

  // Top-left (pin 4)
  const tl_x = - (half_body_w - pad_w / 2 - inset)
  const tl_y = + (half_body_h - pad_h / 2 - inset)
  pads.push(rectpad(4, tl_x, tl_y, pad_w, pad_h))

  // Central exposed pad (EP) - use pad id '5' to denote EP
  pads.push(rectpad(5, 0, 0, ep_w, ep_h))

  return {
    circuitJson: pads as AnyCircuitElement[],
    parameters,
  }
}

export type Utdfn4epParams = z.input<typeof utdfn4ep_def>
