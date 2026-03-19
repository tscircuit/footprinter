import {
  type AnyCircuitElement,
  type PcbSilkscreenPath,
  length,
} from "circuit-json"
import { platedhole } from "src/helpers/platedhole"
import { rectpad } from "src/helpers/rectpad"
import { z } from "zod"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

/**
 * TO-220 Horizontal variant footprint.
 *
 * Matches KiCad TO-220-3_Horizontal_TabDown / TO-220-3_Horizontal_TabUp.
 *
 * Signal pins emerge horizontally in a row; the mounting tab pad extends
 * either downward (tabdown, default) or upward (tabup).
 *
 * Parameters:
 *   tabup   – tab extends toward +Y  (default: false → TabDown, tab toward -Y)
 *   p       – pitch between signal pins (default 2.54mm)
 *   id      – signal pin drill diameter (default 1.0mm)
 *   od      – signal pin annular ring outer diameter (default 1.8mm)
 *   w       – body width (default 10.16mm, KiCad standard)
 *   h       – body height (default 4.0mm, KiCad standard)
 *   tabid   – tab mounting hole drill diameter (default 3.2mm)
 *   tabod   – tab mounting hole outer diameter (default 5.4mm)
 *   tabw    – tab SMT pad width (default 6.6mm)
 *   tabh    – tab SMT pad height (default 4.6mm)
 */
export const to220h_def = base_def.extend({
  fn: z.string(),
  tabup: z.boolean().optional().default(false),
  p: length.optional().default("2.54mm"),
  id: length.optional().default("1.0mm"),
  od: length.optional().default("1.8mm"),
  w: length.optional().default("10.16mm"),
  h: length.optional().default("4.0mm"),
  tabid: length.optional().default("3.2mm"),
  tabod: length.optional().default("5.4mm"),
  tabw: length.optional().default("6.6mm"),
  tabh: length.optional().default("4.6mm"),
  num_pins: z.number().optional(),
  string: z.string().optional(),
})

export type To220hDef = z.input<typeof to220h_def>

export const to220h = (
  raw_params: To220hDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220h_def.parse(raw_params)
  const { tabup, p, id, od, w, h, tabid, tabod, tabw, tabh, string } =
    parameters

  const numPins =
    parameters.num_pins ??
    Number.parseInt(string?.match(/^to220h(?:_|-)(\d+)/i)?.[1] ?? "3")

  // Signal pins in a horizontal row at y = 0
  const signalPins: AnyCircuitElement[] = Array.from(
    { length: numPins },
    (_, i) => {
      const x =
        numPins % 2 === 0
          ? (i - numPins / 2 + 0.5) * p
          : (i - Math.floor(numPins / 2)) * p
      return platedhole(i + 1, x, 0, id, od)
    },
  )

  // Tab pad: large rectangular SMT pad with mounting hole
  // TabDown: tab extends below pins (negative Y); TabUp: above pins (positive Y)
  const tabSign = tabup ? 1 : -1
  const tabCenterY = tabSign * (h / 2 + tabh / 2 + 0.5)

  // Mounting hole in the tab (through-hole, no electrical connection – pin "tab")
  const tabHole: AnyCircuitElement = platedhole(
    numPins + 1,
    0,
    tabCenterY,
    tabid,
    tabod,
  )

  // Silkscreen body outline
  const halfW = w / 2
  const pinsTop = od / 2 + 0.3
  const pinsBottom = -(od / 2 + 0.3)

  // Draw an outline around the body region (between pins and tab)
  const bodyBottom = tabSign > 0 ? pinsBottom : tabCenterY - tabh / 2 - 0.3
  const bodyTop = tabSign > 0 ? tabCenterY + tabh / 2 + 0.3 : pinsTop

  const silkBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: -halfW, y: pinsTop },
      { x: halfW, y: pinsTop },
      { x: halfW, y: pinsBottom },
      { x: -halfW, y: pinsBottom },
      { x: -halfW, y: pinsTop },
    ],
    stroke_width: 0.1,
  }

  // Tab outline
  const tabLeft = -(tabw / 2)
  const tabRight = tabw / 2
  const tabTop = tabCenterY + tabh / 2
  const tabBot = tabCenterY - tabh / 2

  const silkTab: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    route: [
      { x: tabLeft, y: tabTop },
      { x: tabRight, y: tabTop },
      { x: tabRight, y: tabBot },
      { x: tabLeft, y: tabBot },
      { x: tabLeft, y: tabTop },
    ],
    stroke_width: 0.1,
  }

  // Reference designator text: place opposite side from tab
  const refY = tabSign > 0 ? pinsBottom - 0.8 : pinsTop + 0.8
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, refY, 0.5)

  return {
    circuitJson: [
      ...signalPins,
      tabHole,
      silkBody,
      silkTab,
      silkscreenRefText as AnyCircuitElement,
    ],
    parameters: { ...parameters, p, num_pins: numPins },
  }
}
