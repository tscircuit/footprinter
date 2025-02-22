import type { AnyCircuitElement, PcbSilkscreenPath } from "circuit-json"
import { type SilkscreenRef, silkscreenRef } from "src/helpers/silkscreenRef"
import { z } from "zod"
import { rectpad } from "../helpers/rectpad"
import { extendSoicDef, soicWithoutParsing } from "./soic"

export const sot223_def = z.object({
  fn: z.string(),
  num_pins: z.number().default(4),
  w: z.string().default("8.50mm"),
  h: z.string().default("6.90mm"),
  pl: z.string().default("2mm"),
  pw: z.string().default("1.5mm"),
  p: z.string().default("2.30mm"),
  string: z.string().optional(),
})

export const sot223 = (
  raw_params: z.input<typeof sot223_def>,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const match = raw_params.string?.match(/^sot223_(\d+)/)
  const numPins = match ? Number.parseInt(match[1]!, 10) : 4

  if (numPins === 8) {
    const parameters = sot223_8_def.parse({
      ...raw_params,
      num_pins: numPins,
    })
    return {
      circuitJson: soicWithoutParsing(parameters),
      parameters: parameters,
    }
  }

  const parameters = sot223_def.parse({
    ...raw_params,
    num_pins: numPins,
  })

  if (parameters.num_pins === 4) {
    return {
      circuitJson: sot223_4(parameters),
      parameters: parameters,
    }
  }
  if (parameters.num_pins === 5) {
    return {
      circuitJson: sot223_5(parameters),
      parameters: parameters,
    }
  }
  if (parameters.num_pins === 6) {
    return {
      circuitJson: sot223_6(parameters),
      parameters: parameters,
    }
  }
  throw new Error("Invalid number of pins")
}
export const get2CcwSot223Coords = (parameters: {
  num_pins: number
  pn: number
  w: number
  h: number
  pl: number
  p: number
}) => {
  const { pn, w, h, pl, p } = parameters

  if (pn === 1) {
    return { x: -w / 2 + 1.1, y: p }
  }
  if (pn === 2) {
    return { x: -w / 2 + 1.1, y: 0 }
  }
  if (pn === 3) {
    return { x: -w / 2 + 1.1, y: -p }
  }

  return { x: w / 2 - 1.1, y: 0 }
}

export const sot223_4 = (parameters: z.infer<typeof sot223_def>) => {
  const pads: AnyCircuitElement[] = []

  for (let i = 0; i < parameters.num_pins; i++) {
    const { x, y } = get2CcwSot223Coords({
      num_pins: parameters.num_pins,
      pn: i + 1,
      w: Number.parseFloat(parameters.w),
      h: Number.parseFloat(parameters.h),
      pl: Number.parseFloat(parameters.pl),
      p: Number.parseFloat(parameters.p),
    })

    const pinWidth = i === 3 ? 3.8 : Number.parseFloat(parameters.pw)

    pads.push(rectpad(i + 1, x, y, Number.parseFloat(parameters.pl), pinWidth))
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 0, 0.3)

  const width = Number.parseFloat(parameters.w) / 2 - 2.4
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height },
      { x: width, y: height },
      { x: width, y: height / 2 + 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height },
      { x: width, y: -height },
      { x: width, y: -height / 2 - 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  return [
    ...pads,
    silkscreenPath1,
    silkscreenPath2,
    silkscreenRefText as AnyCircuitElement,
  ]
}

export const sot223_8_def = extendSoicDef({
  p: "0.90mm",
  w: "2.8mm",
  legsoutside: true,
})

export const get2CcwSot2235Coords = (parameters: {
  h: number
  p: number
  pn: number
  w: number
}) => {
  const { p, h, pn, w } = parameters
  if (pn === 1) {
    return { x: -w / 2 + 1.2, y: p / 2 + p }
  }
  if (pn === 2) {
    return { x: -w / 2 + 1.2, y: p / 2 }
  }
  if (pn === 3) {
    return { x: -w / 2 + 1.2, y: -p / 2 }
  }
  if (pn === 4) {
    return { x: -w / 2 + 1.2, y: -p / 2 - p }
  }
  if (pn === 5) {
    return { x: w / 2 - 1, y: 0 }
  }
  throw new Error("Invalid pin number")
}

export const sot223_5 = (parameters: z.infer<typeof sot223_def>) => {
  const pads: AnyCircuitElement[] = []
  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = get2CcwSot2235Coords({
      h: Number.parseFloat(parameters.h),
      p: 1.5,
      pn: i,
      w: Number.parseFloat(parameters.w),
    })

    let pinWidth = Number.parseFloat(parameters.pw)
    let pinLength = Number.parseFloat(parameters.pl)

    if (i === 5) {
      pinWidth = 3.4
      pinLength = 1.8
    } else {
      pinWidth = 1
      pinLength = 2.2
    }

    pads.push(rectpad(i, x, y, pinLength, pinWidth))
  }

  const width = Number.parseFloat(parameters.w) / 2 - 2.4
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height },
      { x: width, y: height },
      { x: width, y: height / 2 + 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height },
      { x: width, y: -height },
      { x: width, y: -height / 2 - 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 0, 0.3)

  return [...pads, silkscreenPath1, silkscreenPath2, silkscreenRefText]
}

export const get2CcwSot2236Coords = (parameters: {
  h: number
  p: number
  pn: number
  w: number
}) => {
  const { p, h, pn, w } = parameters
  if (pn === 1) {
    return { x: -w / 2 + 1.2, y: 2 * p }
  }
  if (pn === 2) {
    return { x: -w / 2 + 1.2, y: p }
  }
  if (pn === 3) {
    return { x: -w / 2 + 1.2, y: 0 }
  }
  if (pn === 4) {
    return { x: -w / 2 + 1.2, y: -p }
  }
  if (pn === 5) {
    return { x: -w / 2 + 1.2, y: -2 * p }
  }
  if (pn === 6) {
    return { x: w / 2 - 1.175, y: 0 }
  }
  throw new Error("Invalid pin number")
}

export const sot223_6 = (parameters: z.infer<typeof sot223_def>) => {
  const pads: AnyCircuitElement[] = []
  for (let i = 1; i <= parameters.num_pins; i++) {
    const { x, y } = get2CcwSot2236Coords({
      h: Number.parseFloat(parameters.h),
      p: 1.3,
      pn: i,
      w: 8.7,
    })

    let pinWidth = Number.parseFloat(parameters.pw)
    let pinLength = Number.parseFloat(parameters.pl)

    if (i === 6) {
      pinWidth = 3.4
      pinLength = 2.15
    } else {
      pinWidth = 0.6
      pinLength = 2.2
    }

    pads.push(rectpad(i, x, y, pinLength, pinWidth))
  }

  const width = Number.parseFloat(parameters.w) / 2 - 2.4
  const height = Number.parseFloat(parameters.h) / 2
  const silkscreenPath1: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_1",
    route: [
      { x: -width, y: height },
      { x: width, y: height },
      { x: width, y: height / 2 + 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }
  const silkscreenPath2: PcbSilkscreenPath = {
    layer: "top",
    pcb_component_id: "",
    pcb_silkscreen_path_id: "silkscreen_path_2",
    route: [
      { x: -width, y: -height },
      { x: width, y: -height },
      { x: width, y: -height / 2 - 0.5 },
    ],
    type: "pcb_silkscreen_path",
    stroke_width: 0.1,
  }

  const silkscreenRefText: SilkscreenRef = silkscreenRef(0, 0, 0.3)

  return [...pads, silkscreenPath1, silkscreenPath2, silkscreenRefText]
}
