import type {
  AnyCircuitElement,
  PcbCourtyardOutline,
  PcbSilkscreenPath,
} from "circuit-json"
import { extendSoicDef, type SoicInput, getCcwSoicCoords } from "./soic"
import { rectpad } from "src/helpers/rectpad"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"

export const sop8_def = extendSoicDef({
  w: "7.05mm",
  h: "4.96mm",
  p: "1.27mm",
  pw: "0.65mm",
  pl: "1.975mm",
})

export const sop8 = (
  raw_params: SoicInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = sop8_def.parse(raw_params)
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: parameters.w,
      p: parameters.p ?? 1.27,
      pl: parameters.pl,
      widthincludeslegs: true,
    })
    pads.push(
      rectpad(i + 1, x, y, parameters.pl ?? "1.5mm", parameters.pw ?? "0.6mm"),
    )
  }

  const sh = (parameters.num_pins / 2 - 1) * parameters.p + parameters.pw
  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, sh / 2 + 1, sh / 12)

  const silkscreenLine: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: -parameters.w / 3, y: sh / 2 + 0.4 },
      { x: parameters.w / 3, y: sh / 2 + 0.4 },
    ],
    stroke_width: 0.1,
  }

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: [
      { x: -3.78, y: 2.48 },
      { x: -2.13, y: 2.48 },
      { x: -2.13, y: 2.73 },
      { x: 2.13, y: 2.73 },
      { x: 2.13, y: 2.48 },
      { x: 3.78, y: 2.48 },
      { x: 3.78, y: -2.48 },
      { x: 2.13, y: -2.48 },
      { x: 2.13, y: -2.73 },
      { x: -2.13, y: -2.73 },
      { x: -2.13, y: -2.48 },
      { x: -3.78, y: -2.48 },
    ],
    layer: "top",
  }

  return {
    circuitJson: [
      ...pads,
      silkscreenRefText,
      silkscreenLine,
      courtyard,
    ] as AnyCircuitElement[],
    parameters,
  }
}
