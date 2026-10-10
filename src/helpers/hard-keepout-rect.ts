import type { PCBKeepoutRect } from "circuit-json"

/** A package's mounting-surface restriction, retained with its footprint. */
export const hardKeepoutRect = (
  x: number,
  y: number,
  width: number,
  height: number,
): PCBKeepoutRect => ({
  type: "pcb_keepout",
  pcb_keepout_id: "",
  shape: "rect",
  center: { x, y },
  width,
  height,
  layers: ["top"],
  allow_traces: false,
  allow_placements: false,
  warning_only: false,
})
