import {
  length,
  type AnyCircuitElement,
  type PcbCourtyardOutline,
  type PcbSilkscreenPath,
} from "circuit-json"
import { z } from "zod"
import { platedhole } from "src/helpers/platedhole"
import { silkscreenRef, type SilkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"

const generate_u_curve = (
  centerX: number,
  centerY: number,
  radius: number,
  direction: "left" | "right",
) => {
  return Array.from({ length: 25 }, (_, i) => {
    const theta = (i / 24) * Math.PI - Math.PI / 2
    return {
      x: centerX + (direction === "right" ? 1 : -1) * Math.cos(theta) * radius,
      y: centerY + Math.sin(theta) * radius,
    }
  })
}

export const hc49_def = base_def.extend({
  fn: z.string(),
  p: length.optional().default("4.88mm"),
  id: length.optional().default("0.8mm"),
  od: length.optional().default("1.5mm"),
  w: length.optional().default("5.6mm"),
  h: length.optional().default("3.5mm"),
})

export type Hc49Def = z.input<typeof hc49_def>

const hc49CourtyardOutlineAtPin1 = [
  { x: -0.76, y: 2.83 },
  { x: 5.64, y: 2.83 },
  { x: 6.607917005611641, y: 2.659330116824121 },
  { x: 7.459088935412906, y: 2.1679057740267087 },
  { x: 8.09085189270996, y: 1.415000000000001 },
  { x: 8.427005941024548, y: 0.4914243427974141 },
  { x: 8.427005941024548, y: -0.4914243427974115 },
  { x: 8.090851892709962, y: -1.4149999999999985 },
  { x: 7.459088935412907, y: -2.167905774026706 },
  { x: 6.607917005611643, y: -2.659330116824119 },
  { x: 5.64, y: -2.83 },
  { x: -0.7600000000000002, y: -2.83 },
  { x: -1.7279170056116429, y: -2.659330116824121 },
  { x: -2.5790889354129063, y: -2.167905774026708 },
  { x: -3.2108518927099614, y: -1.4149999999999998 },
  { x: -3.5470059410245485, y: -0.4914243427974127 },
  { x: -3.5470059410245485, y: 0.49142434279741326 },
  { x: -3.210851892709961, y: 1.4150000000000003 },
  { x: -2.5790889354129067, y: 2.1679057740267074 },
  { x: -1.7279170056116417, y: 2.659330116824121 },
]

export const hc49 = (
  raw_params: Hc49Def,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = hc49_def.parse(raw_params)

  const { p, id, od, w, h } = parameters
  const radius = h / 2

  const plated_holes = [
    platedhole(1, -p / 2, 0, id, od),
    platedhole(2, p / 2, 0, id, od),
  ]

  const leftCurve = generate_u_curve(-w / 2, 0, radius, "left")
  const rightCurve = generate_u_curve(w / 2, 0, radius, "right")

  const silkscreenBody: PcbSilkscreenPath = {
    type: "pcb_silkscreen_path",
    layer: "top",
    pcb_component_id: "",
    route: [
      ...leftCurve,
      ...leftCurve.slice(1).reverse(),
      { x: -w / 2, y: -h / 2 },
      { x: w / 2, y: -h / 2 },
      ...rightCurve,
      { x: w / 2, y: h / 2 },
      { x: -w / 2, y: h / 2 },
    ],
    stroke_width: 0.1,
    pcb_silkscreen_path_id: "",
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, p / 4, 0.5)

  const courtyard: PcbCourtyardOutline = {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "",
    pcb_component_id: "",
    outline: hc49CourtyardOutlineAtPin1.map((pt) => ({
      x: pt.x - p / 2,
      y: pt.y,
    })),
    layer: "top",
  }

  return {
    circuitJson: [
      ...plated_holes,
      silkscreenBody,
      silkscreenRefText as AnyCircuitElement,
      courtyard as AnyCircuitElement,
    ],
    parameters,
  }
}
