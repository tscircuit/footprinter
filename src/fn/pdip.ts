import type {
  AnyCircuitElement,
  PcbFabricationNoteText,
  PcbSilkscreenPath,
} from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { platedHolePill } from "../helpers/platedHolePill"
import { platedHoleWithRectPad } from "../helpers/platedHoleWithRectPad"
import { u_curve } from "../helpers/u-curve"
import { getCcwDipCoords, extendDipDef } from "./dip"

/**
 * PDIP (Plastic Dual In-line Package) footprint.
 *
 * PDIP differs from standard DIP by using oblong/oval pads instead of
 * circular pads. Typical PDIP-8 dimensions (matching KiCad DIP-8_W7.62mm_LongPads):
 *   - Row spacing (w): 7.62mm (300mil)
 *   - Pin pitch (p): 2.54mm (100mil)
 *   - Hole diameter (id): 0.8mm
 *   - Pad width (ow): 2.4mm (horizontal, along row direction)
 *   - Pad height (oh): 1.6mm (vertical, along pitch direction)
 *
 * Supports any even pin count (e.g. pdip4, pdip8, pdip14, pdip16, pdip20, pdip28).
 */

export const pdip_def = extendDipDef({})

export const pdip = (
  raw_params: Record<string, any>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const params = { ...raw_params, fn: "pdip" }
  delete params.pdip
  const parameters = pdip_def.parse(params)

  // PDIP uses oblong pads: wider horizontally than vertically
  // Default outer width is 1.5x the outer diameter (od)
  const padWidth = parameters.od * 1.5 // 2.4mm for default od=1.6mm
  const padHeight = parameters.od // 1.6mm

  const platedHoles: AnyCircuitElement[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwDipCoords(
      parameters.num_pins,
      i + 1,
      parameters.w,
      parameters.p ?? 2.54,
      parameters.nosquareplating,
    )
    if (i === 0 && !parameters.nosquareplating) {
      // Pin 1 uses a rectangular pad (same oblong dimensions)
      platedHoles.push(
        platedHoleWithRectPad({
          pn: i + 1,
          x,
          y,
          holeDiameter: parameters.id ?? "0.8mm",
          rectPadWidth: padWidth,
          rectPadHeight: padHeight,
        }),
      )
      continue
    }
    // Non-pin-1 pads use pill (oblong) shape
    platedHoles.push(
      platedHolePill(i + 1, x, y, parameters.id ?? 0.8, padWidth, padHeight),
    )
  }

  // Silkscreen uses the wider pad dimension for clearance
  const innerGap = parameters.w - padWidth
  const sw = innerGap - 1

  const sh = (parameters.num_pins / 2 - 1) * parameters.p + padHeight + 0.4

  const silkscreenBorder: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: sh / 2 },
      ...u_curve.map(({ x, y }) => ({
        x: (x * sw) / 6,
        y: (y * sw) / 6 + sh / 2,
      })),
      { x: sw / 2, y: sh / 2 },
      { x: sw / 2, y: -sh / 2 },
      { x: -sw / 2, y: -sh / 2 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenPins: PcbFabricationNoteText[] = []
  for (let i = 0; i < parameters.num_pins; i++) {
    const isLeft = i < parameters.num_pins / 2
    const clearance = 0.6
    const { y: pinCenterY } = getCcwDipCoords(
      parameters.num_pins,
      i + 1,
      parameters.w,
      parameters.p ?? 2.54,
      parameters.nosquareplating,
    )
    const pinLabelX = isLeft
      ? -parameters.w / 2 - padWidth / 2 - clearance
      : parameters.w / 2 + padWidth / 2 + clearance
    const pinLabelY = pinCenterY
    silkscreenPins.push({
      type: "pcb_fabrication_note_text",
      pcb_fabrication_note_text_id: `pin_${i + 1}`,
      layer: "top",
      pcb_component_id: `pin_${i + 1}`,
      text: `{pin${i + 1}}`,
      anchor_position: { x: pinLabelX, y: pinLabelY },
      font_size: 0.3,
      font: "tscircuit2024",
      anchor_alignment: "top_left",
    })
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 0.5, 0.4)

  return {
    circuitJson: [
      ...platedHoles,
      silkscreenBorder,
      silkscreenRefText,
      ...silkscreenPins,
    ],
    parameters,
  }
}
