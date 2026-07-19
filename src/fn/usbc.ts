import type {
  AnyCircuitElement,
  PcbCourtyardRect,
  PcbPlatedHole,
} from "circuit-json"
import { length } from "circuit-json"
import { z } from "zod"
import { pillpad } from "../helpers/pillpad"
import { platedhole } from "../helpers/platedhole"
import { rectpad } from "../helpers/rectpad"
import { silkscreenpath } from "../helpers/silkscreenpath"
import { silkscreenRef } from "../helpers/silkscreenRef"
import { base_def } from "../helpers/zod/base_def"
import { function_call } from "../helpers/zod/function-call"

type ExplicitPad = {
  height: number
  pill: boolean
  width: number
  x: number
  y: number
}

type ExplicitRoundHole = {
  holeDiameter: number
  outerDiameter: number
  x: number
  y: number
}

type ExplicitMountingHole = {
  holeHeight: number
  holeWidth: number
  outerHeight: number
  outerWidth: number
  x: number
  y: number
}

const parseLength = (value: string) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : length.parse(value)
}

const parseExplicitValues = (
  values: Array<string | number>,
  name: string,
  expectedLength: number,
) =>
  values.map((value) => {
    if (typeof value !== "string") {
      throw new Error(`${name} entries must use colon-separated dimensions`)
    }
    const dimensions = value.split(":")
    if (dimensions.length !== expectedLength) {
      throw new Error(
        `${name} entries must contain ${expectedLength} colon-separated values`,
      )
    }
    return dimensions
  })

export const usbc_def = base_def.extend({
  fn: z.string(),
  /** Number of SMD contacts. `usbc6` remains a shorthand for this value. */
  padcount: z.coerce.number().positive().optional(),
  num_pins: z.coerce.number().optional().default(12),

  /** Inner contact-row pitch and dimensions. */
  p: length.default("0.5mm"),
  pady: length.default("2.125mm"),
  pw: length.default("0.3mm"),
  ph: length.default("1.1mm"),
  pillpads: z.boolean().optional().default(false),

  /** Number of wider outer contacts on each side of the inner row. */
  outerpads: z.coerce.number().optional().default(2),
  outerpw: length.default("0.55mm"),
  outerph: length.optional(),
  outerp: length.default("0.8mm"),
  outergap: length.default("0.65mm"),
  outerpillpads: z.boolean().optional().default(false),

  /** Symmetric circular locating holes. Set roundholecount for variants that include them. */
  roundholecount: z.coerce.number().optional().default(0),
  roundholep: length.default("5.78mm"),
  roundholey: length.default("1.055mm"),
  roundholehd: length.default("0.7mm"),
  roundholeod: length.default("0.7mm"),

  /** Symmetric pill-shaped top and bottom mounting-hole rows. */
  mountingp: length.default("8.65mm"),
  topmountingcount: z.coerce.number().optional().default(2),
  topmountingy: length.default("1.575mm"),
  topmountinghw: length.default("0.6mm"),
  topmountinghh: length.default("1.5mm"),
  topmountingow: length.default("1.1mm"),
  topmountingoh: length.default("2mm"),
  bottommountingcount: z.coerce.number().optional().default(2),
  bottommountingy: length.default("-2.625mm"),
  bottommountinghw: length.default("0.6mm"),
  bottommountinghh: length.default("1.2mm"),
  bottommountingow: length.default("1.2mm"),
  bottommountingoh: length.default("1.8mm"),

  /** Optional package outline. */
  bodyw: length.default("8.8mm"),
  bodyh: length.default("5.5mm"),

  /**
   * Explicit overrides for irregular connector variants.
   * pads(x:y:width:height:rect|pill,...)
   * roundholes(x:y:holeDiameter:outerDiameter,...)
   * mountingholes(x:y:holeWidth:holeHeight:outerWidth:outerHeight,...)
   */
  pads: function_call.default([]),
  roundholes: function_call.default([]),
  mountingholes: function_call.default([]),
})

export type UsbcInput = z.input<typeof usbc_def>

const createPillHole = (
  pn: number,
  hole: ExplicitMountingHole,
): PcbPlatedHole =>
  ({
    pcb_plated_hole_id: "",
    type: "pcb_plated_hole",
    shape: "pill",
    x: hole.x,
    y: hole.y,
    hole_width: hole.holeWidth,
    hole_height: hole.holeHeight,
    outer_width: hole.outerWidth,
    outer_height: hole.outerHeight,
    pcb_port_id: "",
    layers: ["top", "bottom"],
    port_hints: [pn.toString()],
    ccw_rotation: 0,
  }) as PcbPlatedHole

const getSymmetricPositions = (count: number, pitch: number) =>
  Array.from({ length: count }, (_, index) => (index - (count - 1) / 2) * pitch)

/**
 * Configurable USB-C receptacle footprint.
 *
 * The standard parameters cover the common single-row contact layout. The
 * pads, roundholes, and mountingholes function parameters can replace those
 * respective groups for uncommon USB-C connector variants.
 */
export const usbc = (
  rawParams: UsbcInput,
): { circuitJson: AnyCircuitElement[]; parameters: any } => {
  const parameters = usbc_def.parse(rawParams)
  const explicitPads = parseExplicitValues(parameters.pads, "pads", 5).map(
    ([x, y, width, height, shape]) => {
      if (shape !== "rect" && shape !== "pill") {
        throw new Error("pads entries must end with rect or pill")
      }
      return {
        x: parseLength(x!),
        y: parseLength(y!),
        width: parseLength(width!),
        height: parseLength(height!),
        pill: shape === "pill",
      } satisfies ExplicitPad
    },
  )
  const explicitRoundHoles = parseExplicitValues(
    parameters.roundholes,
    "roundholes",
    4,
  ).map(
    ([x, y, holeDiameter, outerDiameter]) =>
      ({
        x: parseLength(x!),
        y: parseLength(y!),
        holeDiameter: parseLength(holeDiameter!),
        outerDiameter: parseLength(outerDiameter!),
      }) satisfies ExplicitRoundHole,
  )
  const explicitMountingHoles = parseExplicitValues(
    parameters.mountingholes,
    "mountingholes",
    6,
  ).map(
    ([x, y, holeWidth, holeHeight, outerWidth, outerHeight]) =>
      ({
        x: parseLength(x!),
        y: parseLength(y!),
        holeWidth: parseLength(holeWidth!),
        holeHeight: parseLength(holeHeight!),
        outerWidth: parseLength(outerWidth!),
        outerHeight: parseLength(outerHeight!),
      }) satisfies ExplicitMountingHole,
  )

  const pads: ExplicitPad[] =
    explicitPads.length > 0
      ? explicitPads
      : (() => {
          const padCount = parameters.padcount ?? parameters.num_pins
          const innerPadCount = padCount - parameters.outerpads * 2
          if (innerPadCount < 0) {
            throw new Error("outerpads cannot exceed half of num_pins")
          }
          const innerPads = getSymmetricPositions(
            innerPadCount,
            parameters.p,
          ).map((x) => ({
            x,
            y: parameters.pady,
            width: parameters.pw,
            height: parameters.ph,
            pill: parameters.pillpads,
          }))
          const innerHalfSpan = ((innerPadCount - 1) * parameters.p) / 2
          const outerPads = [-1, 1].flatMap((side) =>
            Array.from({ length: parameters.outerpads }, (_, index) => ({
              x:
                side *
                (innerHalfSpan +
                  parameters.outergap +
                  index * parameters.outerp),
              y: parameters.pady,
              width: parameters.outerpw,
              height: parameters.outerph ?? parameters.ph,
              pill: parameters.outerpillpads,
            })),
          )
          return [...innerPads, ...outerPads].toSorted(
            (left, right) => left.x - right.x,
          )
        })()

  const roundHoles: ExplicitRoundHole[] =
    explicitRoundHoles.length > 0
      ? explicitRoundHoles
      : getSymmetricPositions(
          parameters.roundholecount,
          parameters.roundholep,
        ).map((x) => ({
          x,
          y: parameters.roundholey,
          holeDiameter: parameters.roundholehd,
          outerDiameter: parameters.roundholeod,
        }))

  const mountingHoles: ExplicitMountingHole[] =
    explicitMountingHoles.length > 0
      ? explicitMountingHoles
      : [
          ...getSymmetricPositions(
            parameters.topmountingcount,
            parameters.mountingp,
          ).map((x) => ({
            x,
            y: parameters.topmountingy,
            holeWidth: parameters.topmountinghw,
            holeHeight: parameters.topmountinghh,
            outerWidth: parameters.topmountingow,
            outerHeight: parameters.topmountingoh,
          })),
          ...getSymmetricPositions(
            parameters.bottommountingcount,
            parameters.mountingp,
          ).map((x) => ({
            x,
            y: parameters.bottommountingy,
            holeWidth: parameters.bottommountinghw,
            holeHeight: parameters.bottommountinghh,
            outerWidth: parameters.bottommountingow,
            outerHeight: parameters.bottommountingoh,
          })),
        ]

  const elements: AnyCircuitElement[] = []
  let pinNumber = 1
  for (const pad of pads) {
    elements.push(
      pad.pill
        ? pillpad(pinNumber, pad.x, pad.y, pad.width, pad.height)
        : rectpad(pinNumber, pad.x, pad.y, pad.width, pad.height),
    )
    pinNumber += 1
  }
  for (const hole of roundHoles) {
    elements.push(
      platedhole(
        pinNumber,
        hole.x,
        hole.y,
        hole.holeDiameter,
        hole.outerDiameter,
      ),
    )
    pinNumber += 1
  }
  for (const hole of mountingHoles) {
    elements.push(createPillHole(pinNumber, hole))
    pinNumber += 1
  }

  if (!parameters.nosilkscreen) {
    const halfBodyWidth = parameters.bodyw / 2
    const halfBodyHeight = parameters.bodyh / 2
    elements.push(
      silkscreenpath(
        [
          { x: -halfBodyWidth, y: -halfBodyHeight },
          { x: halfBodyWidth, y: -halfBodyHeight },
          { x: halfBodyWidth, y: halfBodyHeight },
          { x: -halfBodyWidth, y: halfBodyHeight },
          { x: -halfBodyWidth, y: -halfBodyHeight },
        ],
        { stroke_width: 0.1, layer: "top" },
      ),
    )
    elements.push(silkscreenRef(0, halfBodyHeight + 0.5, 0.35))
  }

  const padExtents = pads.map((pad) => ({
    x: Math.abs(pad.x) + pad.width / 2,
    y: Math.abs(pad.y) + pad.height / 2,
  }))
  const roundHoleExtents = roundHoles.map((hole) => ({
    x: Math.abs(hole.x) + hole.outerDiameter / 2,
    y: Math.abs(hole.y) + hole.outerDiameter / 2,
  }))
  const mountingHoleExtents = mountingHoles.map((hole) => ({
    x: Math.abs(hole.x) + hole.outerWidth / 2,
    y: Math.abs(hole.y) + hole.outerHeight / 2,
  }))
  const allExtents = [
    ...padExtents,
    ...roundHoleExtents,
    ...mountingHoleExtents,
  ]
  const courtyardHalfWidth =
    Math.max(parameters.bodyw / 2, ...allExtents.map((extent) => extent.x)) +
    0.25
  const courtyardHalfHeight =
    Math.max(parameters.bodyh / 2, ...allExtents.map((extent) => extent.y)) +
    0.25
  const courtyard: PcbCourtyardRect = {
    type: "pcb_courtyard_rect",
    pcb_courtyard_rect_id: "",
    pcb_component_id: "",
    center: { x: 0, y: 0 },
    width: courtyardHalfWidth * 2,
    height: courtyardHalfHeight * 2,
    layer: "top",
  }

  return {
    circuitJson: [...elements, courtyard] as AnyCircuitElement[],
    parameters,
  }
}
