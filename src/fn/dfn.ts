import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { extendSoicDef, getCcwSoicCoords } from "./soic"
import { rectpad } from "src/helpers/rectpad"
import { pillpad } from "src/helpers/pillpad"
import type { z } from "zod"
import { CORNERS } from "src/helpers/corner"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { function_call } from "src/helpers/zod/function-call"
import { createThermalPad } from "src/helpers/create-thermal-pad"

export const dfn_def = extendSoicDef({})
export type DfnInput = z.input<typeof dfn_def> & {
  /** Omit nominal pad positions while preserving an even, regular pad grid. */
  missing?: string | Array<string | number>
}

/**
 * Dual Flat No-lead
 *
 * Similar to SOIC but different silkscreen
 */
export const dfn = (
  raw_params: DfnInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const missing = function_call.parse(raw_params.missing ?? [])
  if (
    !missing.every(
      (position): position is number => typeof position === "number",
    )
  ) {
    throw new Error("DFN missing positions must be pad numbers")
  }
  const missingPositions = [...new Set(missing)]
  if (missingPositions.length !== missing.length) {
    throw new Error("DFN missing positions must not contain duplicates")
  }

  const parameters = { ...dfn_def.parse(raw_params), missing: missingPositions }
  const nominalPinCount = parameters.num_pins
  if (
    missingPositions.some(
      (position) => position < 1 || position > nominalPinCount,
    )
  ) {
    throw new Error("DFN missing position is outside the nominal pad range")
  }

  const missingPositionSet = new Set(missingPositions)
  const pads: AnyCircuitElement[] = []
  const cornerRadius = Math.min(parameters.pl, parameters.pw) / 8
  let maxPadExtentY = 0
  let outputPinNumber = 1
  for (
    let nominalPinNumber = 1;
    nominalPinNumber <= nominalPinCount;
    nominalPinNumber += 1
  ) {
    if (missingPositionSet.has(nominalPinNumber)) continue

    const { x, y } = getCcwSoicCoords({
      num_pins: nominalPinCount,
      pn: nominalPinNumber,
      w: parameters.w,
      p: parameters.p ?? 1.27,
      pl: parameters.pl,
      widthincludeslegs: true,
    })
    maxPadExtentY = Math.max(maxPadExtentY, Math.abs(y) + parameters.pw / 2)
    pads.push(
      (parameters.pillpads ? pillpad : rectpad)(
        outputPinNumber,
        x,
        y,
        parameters.pl ?? "1mm",
        parameters.pw ?? "0.6mm",
        cornerRadius,
      ),
    )
    outputPinNumber += 1
  }

  if (parameters.thermalpad) {
    pads.push(createThermalPad(parameters.thermalpad))
  }

  // The silkscreen is 4 corners and an arrow identifier for pin1
  const m = Math.min(1, parameters.p / 2)
  const sw = parameters.w + m
  const sh = maxPadExtentY * 2 + m
  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * parameters.p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * parameters.p },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  // Arrow
  /** arrow size */
  const as = parameters.p / 4
  /** Arrow tip x */
  const atx = -sw / 2 - as / 2
  /** Arrow tip y */
  const aty = sh / 2 - parameters.p / 2

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      {
        x: atx,
        y: aty,
      },
      {
        x: atx - as,
        y: aty + as,
      },
      {
        x: atx - as,
        y: aty - as,
      },
      {
        x: atx,
        y: aty,
      },
    ],
    stroke_width: 0.1,
  })
  const silkscreenRefText: SilkscreenRef = silkscreenRef(
    0,
    sh / 2 + 0.4,
    sh / 12,
  )
  const roundUpToCourtyardGrid = (value: number) =>
    Math.ceil(value / 0.05) * 0.05
  const courtyardHalfWidthMm = roundUpToCourtyardGrid(parameters.w / 2 + 0.25)
  const courtyardHalfHeightMm = roundUpToCourtyardGrid(maxPadExtentY + 0.45)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardHalfWidthMm * 2,
    height: courtyardHalfHeightMm * 2,
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenRefText,
      ...silkscreenPaths,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
