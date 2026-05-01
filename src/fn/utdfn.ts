import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { base_def } from "../helpers/zod/base_def"

const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().default(4),
  /** Package width (X dimension) in mm */
  w: z.number().default(1.0),
  /** Package height (Y dimension) in mm */
  h: z.number().default(1.0),
  /** Pin pitch in mm */
  p: z.number().default(0.5),
  /** Pin pad length (extends outward from body) in mm */
  pl: z.number().default(0.28),
  /** Pin pad width in mm */
  pw: z.number().default(0.22),
  /** Exposed pad width in mm (0 = no exposed pad) */
  epw: z.number().default(0.55),
  /** Exposed pad height in mm (0 = no exposed pad) */
  eph: z.number().default(0.35),
})

type UtdfnInput = z.input<typeof utdfn_def>

/**
 * Ultra-Thin Dual Flat No-Lead with Exposed Pad (UTDFN)
 *
 * Standard UTDFN-4-EP(1x1) dimensions per JEDEC MO-229:
 * - 4 signal pins (2 per side, CCW from top-left)
 * - Exposed thermal pad (EP) at center
 * - 1mm x 1mm body, 0.5mm pitch
 */
export const utdfn = (
  raw_params: UtdfnInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = utdfn_def.parse(raw_params)
  const { num_pins, w, h, p, pl, pw, epw, eph } = parameters

  if (num_pins % 2 !== 0) {
    throw new Error("UTDFN requires an even number of pins")
  }

  const pads: AnyCircuitElement[] = []
  const pinsPerSide = num_pins / 2
  const rowSpan = (pinsPerSide - 1) * p

  // Left-side pins (1..pinsPerSide), top to bottom
  for (let i = 0; i < pinsPerSide; i++) {
    const pn = i + 1
    const x = -(w / 2 + pl / 2)
    const y = rowSpan / 2 - i * p
    pads.push(rectpad(pn, x, y, pl, pw))
  }

  // Right-side pins (pinsPerSide+1..num_pins), bottom to top
  for (let i = 0; i < pinsPerSide; i++) {
    const pn = pinsPerSide + i + 1
    const x = w / 2 + pl / 2
    const y = -rowSpan / 2 + i * p
    pads.push(rectpad(pn, x, y, pl, pw))
  }

  // Exposed pad (thermal pad)
  if (epw > 0 && eph > 0) {
    pads.push(rectpad(["thermalpad"], 0, 0, epw, eph))
  }

  // Silkscreen: corner marks indicating body outline
  const halfW = w / 2
  const halfH = h / 2
  const markLen = Math.min(0.2, p * 0.4)
  const silkscreenPaths: PcbSilkscreenPath[] = [
    // Top-left corner
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "silk_tl",
      stroke_width: 0.05,
      route: [
        { x: -halfW + markLen, y: halfH },
        { x: -halfW, y: halfH },
        { x: -halfW, y: halfH - markLen },
      ],
    },
    // Top-right corner
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "silk_tr",
      stroke_width: 0.05,
      route: [
        { x: halfW - markLen, y: halfH },
        { x: halfW, y: halfH },
        { x: halfW, y: halfH - markLen },
      ],
    },
    // Bottom-right corner
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "silk_br",
      stroke_width: 0.05,
      route: [
        { x: halfW - markLen, y: -halfH },
        { x: halfW, y: -halfH },
        { x: halfW, y: -halfH + markLen },
      ],
    },
    // Bottom-left corner
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "silk_bl",
      stroke_width: 0.05,
      route: [
        { x: -halfW + markLen, y: -halfH },
        { x: -halfW, y: -halfH },
        { x: -halfW, y: -halfH + markLen },
      ],
    },
  ]

  // Pin 1 marker: small triangle at top-left
  silkscreenPaths.push({
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silk_pin1",
    stroke_width: 0.05,
    route: [
      { x: -halfW, y: halfH },
      { x: -halfW - markLen, y: halfH + markLen },
    ],
  })

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, halfH + 0.4, 0.3)

  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    layer: "top",
    center: { x: 0, y: 0 },
    width: w + 2 * pl + 0.5,
    height: h + 0.5,
  }

  return {
    circuitJson: [...pads, ...silkscreenPaths, silkscreenRefText, courtyard],
    parameters,
  }
}
