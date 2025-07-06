import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { z } from "zod"

export const m2host_def = z.object({
  fn: z.string(),
})

export const m2host = (
  raw_params: z.input<typeof m2host_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = m2host_def.parse(raw_params)

  const pads: AnyCircuitElement[] = []
  const padWidth = 0.25
  const padLength = 0.6
  const pitch = 0.5
  const rowOffset = 0.25
  const numPads = 75

  const startX = -((numPads - 1) * pitch) / 2

  for (let i = 0; i < numPads; i++) {
    const pn = i + 1
    if (pn >= 24 && pn <= 31) continue
    const x = startX + i * pitch
    const y = i % 2 === 0 ? 0 : -rowOffset
    const pad = rectpad(pn, x, y, padWidth, padLength)
    pad.layer = pn % 2 === 0 ? "bottom" : "top"
    pads.push(pad)
  }

  const cutoutWidth = 46 * 0.0254
  const cutoutDepth = 137 * 0.0254
  const cutoutOffsetFromPin1 = 261 * 0.0254
  const cutout = {
    type: "pcb_cutout",
    pcb_cutout_id: "",
    shape: "rect" as const,
    center: { x: startX + cutoutOffsetFromPin1, y: -cutoutDepth / 2 },
    width: cutoutWidth,
    height: cutoutDepth,
  }

  const pin1MarkerPosition = {
    x: startX - 0.8,
    y: 0,
  }

  const pin1Marker: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "pin_marker_1",
    route: [
      { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
      { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y + 0.3 },
      { x: pin1MarkerPosition.x - 0.7, y: pin1MarkerPosition.y - 0.3 },
      { x: pin1MarkerPosition.x - 0.4, y: pin1MarkerPosition.y },
    ],
    stroke_width: 0.05,
    pcb_silkscreen_path_id: "pin_marker_1",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, padLength, 0.5)

  return {
    circuitJson: [...pads, cutout, silkscreenRefText, pin1Marker],
    parameters,
  }
}
