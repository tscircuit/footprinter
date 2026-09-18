import type { AnyCircuitElement } from "circuit-json"
import { quad, quad_def } from "./quad"
import type { z } from "zod"

export const tqfp_def = quad_def

// TQFP (Thin Quad Flat Package) with intelligent defaults
export const tqfp = (
  raw_params: z.input<typeof quad_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  raw_params.legsoutside = true

  // Apply pitch defaults based on pin count if not specified
  if (!raw_params.p) {
    switch (raw_params.num_pins) {
      case 32:
      // TQFP-44 is a 10x10mm body on 0.8mm pitch (JEDEC MS-026 BBA), same
      // family as TQFP-32 — NOT the 0.5mm-pitch group.
      case 44:
        raw_params.p = 0.8
        break
      case 48:
      case 64:
      case 80:
      case 100:
        raw_params.p = 0.5
        break
      case 144:
        raw_params.p = 0.5
        break
    }
  }

  // Apply pad length defaults if not specified
  // Based on KiCad footprint library standards
  if (!raw_params.pl) {
    switch (raw_params.num_pins) {
      case 32:
      case 44:
      case 48:
      case 64:
      case 80:
      case 100:
        raw_params.pl = 1.475
        break
      case 144:
        raw_params.pl = 1.6
        break
    }
  }

  // Apply pad width defaults if not specified
  // Based on KiCad footprint library standards
  if (!raw_params.pw) {
    switch (raw_params.num_pins) {
      case 32:
      // TQFP-44 leads are 0.55mm wide (KiCad TQFP-44_10x10mm_P0.8mm), same
      // family as TQFP-32 — NOT the 0.3mm group.
      case 44:
        raw_params.pw = 0.55
        break
      case 48:
      case 64:
      case 80:
      case 100:
        raw_params.pw = 0.3
        break
      case 144:
        raw_params.pw = 0.25
        break
    }
  }

  return quad(raw_params)
}
