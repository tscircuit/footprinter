import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { mm } from "@tscircuit/mm"
import { length } from "circuit-json"
import { z } from "zod"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { platedHolePill } from "../helpers/platedHolePill"
import { type SilkscreenRef, silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

// TO-220 Horizontal uses 2.54mm standard pitch (matches KiCad)
const TO220H_PITCH_MM = 2.54

export const to220h_def = base_def.extend({
  fn: z.string(),
  id: length.optional().default("1.1mm"),
  od: length.optional().default("1.905mm"),
  ph: length.optional().default("2mm"),
  num_pins: z.number().optional(),
  // tabup / tabdown can be passed as boolean flags (from footprinter string parser)
  // or "tab" can be set explicitly
  tabup: z.boolean().optional(),
  tabdown: z.boolean().optional(),
  string: z.string().optional(),
})

export type To220hDef = z.input<typeof to220h_def>

export const to220h = (
  raw_params: To220hDef,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = to220h_def.parse(raw_params)

  const numPins =
    parameters.num_pins ??
    Number.parseInt(
      parameters.string?.match(/^to220h(?:[_-](\d+))?/i)?.[1] ?? "3",
    )

  // Determine tab direction: tabup flag takes precedence, default is "down"
  const isTabUp =
    parameters.tabup === true ||
    (parameters.string !== undefined && /tabup/i.test(parameters.string))
  const sign = isTabUp ? -1 : 1

  // Holes: centered at x=0 with 2.54mm pitch (matches to220f)
  const holes: AnyCircuitElement[] = Array.from(
    { length: numPins },
    (_, i) => {
      const x =
        numPins % 2 === 0
          ? (i - numPins / 2 + 0.5) * TO220H_PITCH_MM
          : (i - Math.floor(numPins / 2)) * TO220H_PITCH_MM

      if (i === 0) {
        return platedHoleWithRectPad({
          pn: 1,
          x,
          y: 0,
          holeDiameter: parameters.id,
          rectPadWidth: parameters.od,
          rectPadHeight: parameters.ph,
        }) as AnyCircuitElement
      }

      return platedHolePill(
        i + 1,
        x,
        0,
        mm(parameters.id),
        mm(parameters.od),
        mm(parameters.ph),
      ) as AnyCircuitElement
    },
  )

  // Body silkscreen dimensions derived from KiCad TO-220-3_Horizontal_TabDown
  // KiCad pins at x=0,2.54,5.08 (our pins centered at x=0: -2.54,0,2.54)
  // KiCad body x: -2.57 to 7.65 → width = 10.22mm, center at 2.54
  // Translating to our center-at-0: x from -5.11 to 5.11
  // KiCad body y (TabDown): near=3.7, far=13.17, tab far=19.57
  // Lead clearance: 3.7mm; body height: 9.47mm; tab: 6.4mm
  const bodyXLeft = -5.11
  const bodyXRight = 5.11
  const leadClearance = 3.7 - TO220H_PITCH_MM // 1.16mm (pad edge to body)
  const bodyH = 9.47
  const tabH = 6.4

  const bodyNearY = sign * leadClearance
  const bodyFarY = sign * (leadClearance + bodyH)
  const tabFarY = sign * (leadClearance + bodyH + tabH)

  // Body outline
  const silkBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_body",
    stroke_width: 0.12,
    route: [
      { x: bodyXLeft, y: bodyNearY },
      { x: bodyXRight, y: bodyNearY },
      { x: bodyXRight, y: bodyFarY },
      { x: bodyXLeft, y: bodyFarY },
      { x: bodyXLeft, y: bodyNearY },
    ],
  }

  // Tab outline
  const silkTab: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_tab",
    stroke_width: 0.12,
    route: [
      { x: bodyXLeft, y: bodyFarY },
      { x: bodyXRight, y: bodyFarY },
      { x: bodyXRight, y: tabFarY },
      { x: bodyXLeft, y: tabFarY },
      { x: bodyXLeft, y: bodyFarY },
    ],
  }

  // Lead lines from body edge toward pin holes
  const halfPw = mm(parameters.od) / 2
  const leadLines: PcbSilkscreenPath[] = Array.from(
    { length: numPins },
    (_, i) => {
      const x =
        numPins % 2 === 0
          ? (i - numPins / 2 + 0.5) * TO220H_PITCH_MM
          : (i - Math.floor(numPins / 2)) * TO220H_PITCH_MM
      return {
        type: "pcb_silkscreen_path" as const,
        layer: "top" as const,
        pcb_component_id: "",
        pcb_silkscreen_path_id: `silkscreen_lead_${i + 1}`,
        stroke_width: 0.12,
        route: [
          { x: x - halfPw, y: bodyNearY },
          { x: x - halfPw, y: sign * halfPw },
        ],
      }
    },
  )

  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    isTabUp ? leadClearance + 0.8 : -(leadClearance + 0.8),
    0.5,
  )

  return {
    circuitJson: [
      ...holes,
      silkBody,
      silkTab,
      ...leadLines,
      silkscreenRefText as AnyCircuitElement,
    ],
    parameters: {
      ...parameters,
      p: TO220H_PITCH_MM,
      num_pins: numPins,
    },
  }
}
