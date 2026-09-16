import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
  PcbSmtPad,
} from "circuit-json"
import { length } from "circuit-json"
import { polygonpad } from "src/helpers/polygonpad"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "src/helpers/zod/base_def"
import { dim2d } from "src/helpers/zod/dim-2d"
import { z } from "zod"
import { getDfnCornerPadPoints } from "./dfn"

type UtdfnDefaults = {
  w?: string
  h?: string
  p?: string
  pw?: string
  pl?: string
  p1l?: string
  span?: string
  cornerpadcutlength?: string
  thermalpad?: string
}

export const extendUtdfnDef = (defaults: UtdfnDefaults) =>
  base_def.extend({
    fn: z.literal("utdfn"),
    num_pins: z.literal(4).default(4),
    w: length.default(defaults.w ?? "1mm"),
    h: length.default(defaults.h ?? "1mm"),
    p: length.default(defaults.p ?? "0.65mm"),
    pw: length.default(defaults.pw ?? "0.25mm"),
    pl: length.default(defaults.pl ?? "0.4mm"),
    p1l: length.default(defaults.p1l ?? "0.47mm"),
    span: length.default(defaults.span ?? "1.3mm"),
    cornerpadcutlength: length.default(defaults.cornerpadcutlength ?? "0.18mm"),
    ep: z.boolean().default(true),
    thermalpad: dim2d.default(defaults.thermalpad ?? "0.48x0.48mm"),
  })

export const utdfn_def = extendUtdfnDef({})
export type UtdfnParameters = z.infer<typeof utdfn_def>

const createRotatedThermalPad = (
  dimensions: UtdfnParameters["thermalpad"],
): Extract<PcbSmtPad, { shape: "rotated_rect" }> => ({
  type: "pcb_smtpad",
  pcb_smtpad_id: "",
  port_hints: ["thermalpad"],
  layer: "top",
  x: 0,
  y: 0,
  width: dimensions.x,
  height: dimensions.y,
  shape: "rotated_rect",
  ccw_rotation: 45,
})

export const utdfn = (
  rawParameters: z.input<typeof utdfn_def>,
): {
  circuitJson: AnyCircuitElement[]
  parameters: UtdfnParameters
} => {
  const parameters = utdfn_def.parse(rawParameters)
  const { w, h, p, pw, pl, p1l, span, cornerpadcutlength, ep, thermalpad } =
    parameters

  if (cornerpadcutlength <= 0 || cornerpadcutlength > Math.min(pl, pw)) {
    throw new Error("UTDFN corner pad cut length must fit within the pad")
  }
  if (p1l < pl || p1l > span) {
    throw new Error("UTDFN pin 1 land length must fit within the pad span")
  }

  const halfSpan = span / 2
  const halfPitch = p / 2
  const signalPads = [
    { pin: 1, x: -halfSpan + p1l / 2, y: halfPitch, length: p1l },
    { pin: 2, x: -halfSpan + pl / 2, y: -halfPitch, length: pl },
    { pin: 3, x: halfSpan - pl / 2, y: -halfPitch, length: pl },
    { pin: 4, x: halfSpan - pl / 2, y: halfPitch, length: pl },
  ].map(({ pin, x, y, length }) =>
    polygonpad(
      pin,
      getDfnCornerPadPoints({
        x,
        y,
        padWidth: length,
        padHeight: pw,
        cutLength: pin === 1 ? pw : cornerpadcutlength,
      }),
    ),
  )

  const pads: AnyCircuitElement[] = ep
    ? [...signalPads, createRotatedThermalPad(thermalpad)]
    : signalPads

  const silkStrokeWidth = 0.12
  const silkY = h / 2 + 0.21
  const silkscreenPaths: PcbSilkscreenPath[] = [
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -w / 2, y: silkY },
        { x: w / 2, y: silkY },
      ],
      stroke_width: silkStrokeWidth,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -w / 2, y: -silkY },
        { x: w / 2, y: -silkY },
      ],
      stroke_width: silkStrokeWidth,
    },
    {
      type: "pcb_silkscreen_path",
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: -0.84, y: 0.64 },
        { x: -1.12, y: 0.64 },
        { x: -0.84, y: 0.92 },
        { x: -0.84, y: 0.64 },
      ],
      stroke_width: silkStrokeWidth,
    },
  ]

  const ref: SilkscreenRef = silkscreenRef(0, silkY + 0.45, 0.2)
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: Math.max(w, span) + 0.5,
    height: Math.max(h, p + pw) + 0.5,
    layer: "top",
  }

  return {
    circuitJson: [...pads, ...silkscreenPaths, ref, courtyard],
    parameters,
  }
}
