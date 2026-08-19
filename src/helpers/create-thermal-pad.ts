import type { PcbSmtPad, Point } from "circuit-json"
import { length } from "circuit-json"
import { polygonpad } from "./polygonpad"
import { rectpad } from "./rectpad"
import { dim2d } from "./zod/dim-2d"

export const thermalPadOffsetFields = {
  thermalpadcenteroffsetx: length.optional().default(0),
  thermalpadcenteroffsety: length.optional().default(0),
}

const thermalPadNotchDimensions = dim2d.refine(
  ({ x, y }) => x > 0 && y > 0,
  "thermalpad notch dimensions must be positive",
)

export const thermalPadShapeFields = {
  thermalpadnotchtopbottom: thermalPadNotchDimensions.optional(),
  thermalpadnotchleftright: thermalPadNotchDimensions.optional(),
}

type Dimensions2d = { x: number; y: number }

type ThermalPadNotches = {
  sides: "top-bottom" | "left-right"
  width: number
  height: number
}

type ThermalPadShapeParameters = {
  thermalpadnotchtopbottom?: Dimensions2d
  thermalpadnotchleftright?: Dimensions2d
}

export const resolveThermalPadNotches = ({
  thermalpadnotchtopbottom,
  thermalpadnotchleftright,
}: ThermalPadShapeParameters): ThermalPadNotches | undefined => {
  if (thermalpadnotchtopbottom && thermalpadnotchleftright) {
    throw new Error(
      "thermalpadnotchtopbottom and thermalpadnotchleftright cannot be combined",
    )
  }

  if (thermalpadnotchtopbottom) {
    return {
      sides: "top-bottom",
      width: thermalpadnotchtopbottom.x,
      height: thermalpadnotchtopbottom.y,
    }
  }
  if (thermalpadnotchleftright) {
    return {
      sides: "left-right",
      width: thermalpadnotchleftright.x,
      height: thermalpadnotchleftright.y,
    }
  }
}

const getNotchedThermalPadPoints = (
  dimensions: Dimensions2d,
  offset: Point,
  notches: ThermalPadNotches,
): Point[] => {
  const left = offset.x - dimensions.x / 2
  const right = offset.x + dimensions.x / 2
  const bottom = offset.y - dimensions.y / 2
  const top = offset.y + dimensions.y / 2

  if (notches.sides === "top-bottom") {
    if (notches.width >= dimensions.x || notches.height * 2 >= dimensions.y) {
      throw new Error(
        "top/bottom thermalpad notches must be narrower than the pad and less than half its height",
      )
    }

    const notchLeft = offset.x - notches.width / 2
    const notchRight = offset.x + notches.width / 2
    const lowerNotchTop = bottom + notches.height
    const upperNotchBottom = top - notches.height
    return [
      { x: left, y: top },
      { x: notchLeft, y: top },
      { x: notchLeft, y: upperNotchBottom },
      { x: notchRight, y: upperNotchBottom },
      { x: notchRight, y: top },
      { x: right, y: top },
      { x: right, y: bottom },
      { x: notchRight, y: bottom },
      { x: notchRight, y: lowerNotchTop },
      { x: notchLeft, y: lowerNotchTop },
      { x: notchLeft, y: bottom },
      { x: left, y: bottom },
    ]
  }

  if (notches.width * 2 >= dimensions.x || notches.height >= dimensions.y) {
    throw new Error(
      "left/right thermalpad notches must be less than half the pad width and shorter than its height",
    )
  }

  const leftNotchRight = left + notches.width
  const rightNotchLeft = right - notches.width
  const notchBottom = offset.y - notches.height / 2
  const notchTop = offset.y + notches.height / 2
  return [
    { x: left, y: bottom },
    { x: left, y: notchBottom },
    { x: leftNotchRight, y: notchBottom },
    { x: leftNotchRight, y: notchTop },
    { x: left, y: notchTop },
    { x: left, y: top },
    { x: right, y: top },
    { x: right, y: notchTop },
    { x: rightNotchLeft, y: notchTop },
    { x: rightNotchLeft, y: notchBottom },
    { x: right, y: notchBottom },
    { x: right, y: bottom },
  ]
}

const createNotchedThermalPad = (
  dimensions: Dimensions2d,
  offset: Point,
  notches: ThermalPadNotches,
): PcbSmtPad =>
  polygonpad(
    ["thermalpad"],
    getNotchedThermalPadPoints(dimensions, offset, notches),
  )

export const createThermalPad = (
  dimensions: Dimensions2d,
  offset: Point,
  notches?: ThermalPadNotches,
): PcbSmtPad => {
  if (notches) return createNotchedThermalPad(dimensions, offset, notches)

  return rectpad(["thermalpad"], offset.x, offset.y, dimensions.x, dimensions.y)
}
