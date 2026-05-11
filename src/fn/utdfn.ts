import { dfn } from "./dfn"

const UTDFN4_W = 1.0 // mm
const UTDFN4_H = 0.6 // mm
const UTDFN4_P = 0.5 // mm pitch
const UTDFN4_THERMALPAD_X = 0.6 // mm
const UTDFN4_THERMALPAD_Y = 0.4 // mm

export const utdfn = (
  raw_params: { fn?: string; num_pins?: number; w?: number; h?: number; p?: number; thermalpad?: { x?: number; y?: number }; string?: string; [key: string]: any },
): ReturnType<typeof dfn> => {
  // Extract num_pins from string if not provided
  const numPinsFromString = typeof raw_params.string === "string"
    ? Number.parseInt(raw_params.string.match(/^utdfn(\d+)/)?.[1] ?? "")
    : NaN
  const num_pins = raw_params.num_pins ?? (Number.isNaN(numPinsFromString) ? 4 : numPinsFromString)

  // Build params object - only include optional params if explicitly set
  const params: any = { fn: "utdfn", num_pins }
  if (raw_params.w !== undefined) params.w = raw_params.w
  if (raw_params.h !== undefined) params.h = raw_params.h
  if (raw_params.p !== undefined) params.p = raw_params.p
  if (raw_params.thermalpad !== undefined) params.thermalpad = raw_params.thermalpad
  if (raw_params.num_pins !== undefined) params.num_pins = raw_params.num_pins

  // Apply UTDFN-4-EP(1x1) defaults
  if (raw_params.w === undefined) params.w = UTDFN4_W
  if (raw_params.h === undefined) params.h = UTDFN4_H
  if (raw_params.p === undefined) params.p = UTDFN4_P
  if (raw_params.thermalpad === undefined) {
    params.thermalpad = { x: UTDFN4_THERMALPAD_X, y: UTDFN4_THERMALPAD_Y }
  }

  return dfn(params)
}
