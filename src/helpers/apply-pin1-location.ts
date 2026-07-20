import type { AnyCircuitElement } from "circuit-json"
import type { Pin1Location } from "./zod/pin1-location"

type RightAngleRotation = 0 | 90 | 180 | 270
type Point = { x: number; y: number }

const RIGHT_ANGLE_ROTATIONS: RightAngleRotation[] = [0, 90, 180, 270]

const rotatePoint = (point: Point, rotation: RightAngleRotation): Point => {
  switch (rotation) {
    case 90:
      return { x: -point.y, y: point.x }
    case 180:
      return { x: -point.x, y: -point.y }
    case 270:
      return { x: point.y, y: -point.x }
    default:
      return { ...point }
  }
}

const getPadCenter = (pad: any): Point | null => {
  if (typeof pad.x === "number" && typeof pad.y === "number") {
    return { x: pad.x, y: pad.y }
  }

  if (Array.isArray(pad.points) && pad.points.length > 0) {
    const xs = pad.points.map((point: Point) => point.x)
    const ys = pad.points.map((point: Point) => point.y)
    return {
      x: (Math.min(...xs) + Math.max(...xs)) / 2,
      y: (Math.min(...ys) + Math.max(...ys)) / 2,
    }
  }

  return null
}

const isPin1 = (pad: any) =>
  pad.port_hints?.some((hint: unknown) => /^(?:pin)?1$/i.test(String(hint)))

const pinMatchesLocation = (
  padCenters: Point[],
  pin1Center: Point,
  [side, alignment]: Pin1Location,
) => {
  const xs = padCenters.map((point) => point.x)
  const ys = padCenters.map((point) => point.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const centerX = (minX + maxX) / 2
  const centerY = (minY + maxY) / 2
  const spanX = maxX - minX
  const spanY = maxY - minY
  const tolerance = Math.max(spanX, spanY, 1) * 1e-6

  const onRequestedSide =
    (side === "leftside" && Math.abs(pin1Center.x - minX) <= tolerance) ||
    (side === "rightside" && Math.abs(pin1Center.x - maxX) <= tolerance) ||
    (side === "topside" && Math.abs(pin1Center.y - maxY) <= tolerance) ||
    (side === "bottomside" && Math.abs(pin1Center.y - minY) <= tolerance)

  const atRequestedAlignment =
    (alignment === "left" &&
      (spanX <= tolerance || pin1Center.x < centerX - tolerance)) ||
    (alignment === "right" &&
      (spanX <= tolerance || pin1Center.x > centerX + tolerance)) ||
    (alignment === "top" &&
      (spanY <= tolerance || pin1Center.y > centerY + tolerance)) ||
    (alignment === "bottom" &&
      (spanY <= tolerance || pin1Center.y < centerY - tolerance))

  return onRequestedSide && atRequestedAlignment
}

const rotatePointField = (value: unknown, rotation: RightAngleRotation) => {
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as Point).x !== "number" ||
    typeof (value as Point).y !== "number"
  ) {
    return
  }

  const rotated = rotatePoint(value as Point, rotation)
  ;(value as Point).x = rotated.x
  ;(value as Point).y = rotated.y
}

const normalizeRotation = (rotation: number) => ((rotation % 360) + 360) % 360

const rotateElements = (
  elements: AnyCircuitElement[],
  rotation: RightAngleRotation,
) => {
  if (rotation === 0) return elements

  const rotatedElements = structuredClone(elements)

  for (const element of rotatedElements as any[]) {
    if (typeof element.x === "number" && typeof element.y === "number") {
      const rotated = rotatePoint(element, rotation)
      element.x = rotated.x
      element.y = rotated.y
    }

    rotatePointField(element.center, rotation)
    rotatePointField(element.anchor_position, rotation)

    for (const field of ["route", "outline", "points"] as const) {
      if (!Array.isArray(element[field])) continue
      for (const point of element[field]) {
        rotatePointField(point, rotation)
      }
    }

    if (
      (element.type === "pcb_smtpad" && element.shape !== "polygon") ||
      element.type === "pcb_plated_hole" ||
      element.type === "pcb_silkscreen_text" ||
      element.type === "pcb_fabrication_note_text"
    ) {
      element.ccw_rotation = normalizeRotation(
        Number(element.ccw_rotation ?? 0) + rotation,
      )
    }

    if (
      (rotation === 90 || rotation === 270) &&
      (element.type === "pcb_courtyard_rect" ||
        element.type === "pcb_silkscreen_rect" ||
        element.type === "pcb_fabrication_note_rect" ||
        (element.type === "pcb_cutout" && element.shape === "rect"))
    ) {
      ;[element.width, element.height] = [element.height, element.width]
    }
  }

  return rotatedElements
}

export const applyPin1Location = (
  elements: AnyCircuitElement[],
  pin1Location: Pin1Location | undefined,
): AnyCircuitElement[] => {
  if (!pin1Location) return elements

  const pads = (elements as any[]).filter(
    (element) =>
      element.type === "pcb_smtpad" || element.type === "pcb_plated_hole",
  )
  const pin1 = pads.find(isPin1)
  const padCenters = pads.map(getPadCenter).filter((point) => point !== null)
  const pin1Center = pin1 ? getPadCenter(pin1) : null

  if (!pin1 || !pin1Center || padCenters.length === 0) {
    throw new Error(
      `pin1location(${pin1Location.join(",")}) requires a footprint with a pad whose port_hints contain "1" or "pin1"`,
    )
  }

  const rotation = RIGHT_ANGLE_ROTATIONS.find((candidateRotation) => {
    const rotatedPads = padCenters.map((point) =>
      rotatePoint(point, candidateRotation),
    )
    const rotatedPin1 = rotatePoint(pin1Center, candidateRotation)
    return pinMatchesLocation(rotatedPads, rotatedPin1, pin1Location)
  })

  if (rotation === undefined) {
    throw new Error(
      `pin1location(${pin1Location.join(",")}) cannot be reached with a rotation; the requested location may be the mirrored orientation of this footprint`,
    )
  }

  return rotateElements(elements, rotation)
}
