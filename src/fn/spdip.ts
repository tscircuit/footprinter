import { dip } from "./dip"
import { z } from "zod"

const SPDIP_PITCH = 1.778 // mm (shrink pitch: 0.070")
const SPDIP_WIDTH = 7.62 // mm (narrow body: 0.3")

export const spdip = (
  raw_params: { fn?: string; num_pins?: number; p?: number; w?: number; string?: string; [key: string]: any },
): ReturnType<typeof dip> => {
  // Extract num_pins from string if not provided
  const numPinsFromString = typeof raw_params.string === "string"
    ? Number.parseInt(raw_params.string.match(/^spdip(\d+)/)?.[1] ?? "")
    : NaN

  const num_pins = raw_params.num_pins ?? (Number.isNaN(numPinsFromString) ? 28 : numPinsFromString)
  const p = raw_params.p ?? SPDIP_PITCH
  const w = raw_params.w ?? SPDIP_WIDTH

  return dip({ ...raw_params, num_pins, p, w })
}
