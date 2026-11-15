import type { AnyCircuitElement } from "circuit-json"
import { dfn } from "./dfn"
import type { DfnInput } from "./dfn"

const defined = (v: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(v).filter(([, value]) => value !== undefined),
  )

/**
 * UDFN / UTDFN with an exposed thermal pad.
 *
 * Defaults follow KiCad UDFN-4-1EP_1x1mm_P0.65mm_EP0.48x0.48mm:
 * four 0.22mm x 0.25mm pads at +-0.54mm on 0.65mm pitch and a
 * 0.48mm x 0.48mm center exposed pad. `utdfn4ep`, `utdfn-4-ep`, and
 * `UTDFN-4-EP(1x1)` all resolve to this generator with four pins.
 */
export const utdfn = (
  raw_params: DfnInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  return dfn({
    ...defined({
      num_pins: 4,
      w: "1.3mm",
      p: "0.65mm",
      pl: "0.22mm",
      pw: "0.25mm",
      thermalpad: "0.48mmx0.48mm",
    }),
    ...defined(raw_params as Record<string, unknown>),
    fn: "utdfn",
  } as DfnInput)
}
