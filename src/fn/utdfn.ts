import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { length } from "circuit-json"
import { rectpad } from "../helpers/rectpad"
import { silkscreenRef, type SilkscreenRef } from "src/helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { getCcwSoicCoords } from "./soic"
import { CORNERS } from "src/helpers/corner"

export const utdfn_def = base_def.extend({
  fn: z.string(),
  num_pins: z.number().optional().default(4),
  w: length.default(length.parse("1.45mm")),
  p: length.default(length.parse("0.65mm")),
  pl: length.default(length.parse("0.35mm")),
  pw: length.default(length.parse("0.25mm")),
  ep: z.boolean().default(false),
  epw: length.default(length.parse("1mm")),
  eph: length.default(length.parse("1mm")),
  string: z.string().optional(),
})

export const utdfn = (
  raw_params: any,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  if (raw_params.string?.includes("_ep")) {
    raw_params.ep = true
    const epMatch = raw_params.string.match(/_ep(\d+(?:\.\d+)?)x(\d+(?:\.\d+)?)/)
    if (epMatch) {
      raw_params.epw = `${epMatch[1]}mm`
      raw_params.eph = `${epMatch[2]}mm`
    }
  }

  const parameters = utdfn_def.parse(raw_params)

  const w = parameters.w
  const p = parameters.p
  const pl = parameters.pl
  const pw = parameters.pw
  const epw = parameters.epw
  const eph = parameters.eph

  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = getCcwSoicCoords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w,
      p,
      pl,
      legsoutside: true,
    })
    pads.push(rectpad(i + 1, x, y, pl, pw))
  }

  if (parameters.ep) {
    pads.push(rectpad(parameters.num_pins + 1, 0, 0, epw, eph))
  }

  const m = Math.min(0.5, p / 2)
  const sw = w + m
  const sh = (parameters.num_pins / 2 - 1) * p + pw + m

  const silkscreenPaths: PcbSilkscreenPath[] = []

  for (const corner of CORNERS) {
    const { dx, dy } = corner
    silkscreenPaths.push({
      layer: "top",
      pcb_component_id: "",
      pcb_silkscreen_path_id: "",
      route: [
        { x: (dx * sw) / 2 - dx * p, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 },
        { x: (dx * sw) / 2, y: (dy * sh) / 2 - dy * p },
      ],
      type: "pcb_silkscreen_path",
      stroke_width: 0.1,
    })
  }

  const as = p / 4
  const atx = -sw / 2 - as / 2
  const aty = sh / 2 - p / 2

  silkscreenPaths.push({
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "",
    type: "pcb_silkscreen_path",
    route: [
      { x: atx, y: aty },
      { x: atx - as, y: aty + as },
      { x: atx - as, y: aty - as },
      { x: atx, y: aty },
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
  const pinRowSpanY =
    (parameters.num_pins / 2 - 1) * p + pw
  const courtyardHalfWidthMm = roundUpToCourtyardGrid(w / 2 + 0.25)
  const courtyardHalfHeightMm = roundUpToCourtyardGrid(pinRowSpanY / 2 + 0.45)
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
