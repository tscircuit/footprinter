import type { AnyCircuitElement } from "circuit-json"
import type { Pin1Alignment, Pin1Location, Pin1Side } from "./zod/pin1-location"

type RightAngleRotation = 0 | 90 | 180 | 270
type Point = { x: number; y: number }
type FootprintTransform = {
  rotation: RightAngleRotation
  mirrored: boolean
}

const RIGHT_ANGLE_ROTATIONS: RightAngleRotation[] = [0, 90, 180, 270]
const FOOTPRINT_TRANSFORMS: FootprintTransform[] = [
  ...RIGHT_ANGLE_ROTATIONS.map((rotation) => ({
    rotation,
    mirrored: false,
  })),
  ...RIGHT_ANGLE_ROTATIONS.map((rotation) => ({
    rotation,
    mirrored: true,
  })),
]

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

const transformPoint = (
  point: Point,
  { rotation, mirrored }: FootprintTransform,
): Point =>
  rotatePoint(mirrored ? { x: -point.x, y: point.y } : point, rotation)

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

const getPinNumber = (pad: any): number | null => {
  for (const hint of pad.port_hints ?? []) {
    const match = String(hint).match(/^(?:pin)?(\d+)$/i)
    if (match) return Number(match[1])
  }
  return null
}

const inferPin1Location = (
  padCenters: Point[],
  pin1Center: Point,
  nextPinCenter: Point | null,
): { side: Pin1Side; alignment?: Pin1Alignment } | null => {
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

  const candidates: Pin1Side[] = []
  if (spanX > tolerance) {
    if (Math.abs(pin1Center.x - minX) <= tolerance) candidates.push("leftside")
    if (Math.abs(pin1Center.x - maxX) <= tolerance) candidates.push("rightside")
  }
  if (spanY > tolerance) {
    if (Math.abs(pin1Center.y - maxY) <= tolerance) candidates.push("topside")
    if (Math.abs(pin1Center.y - minY) <= tolerance)
      candidates.push("bottomside")
  }

  if (candidates.length === 0) return null

  const isOnSide = (point: Point, side: Pin1Side) =>
    (side === "leftside" && Math.abs(point.x - minX) <= tolerance) ||
    (side === "rightside" && Math.abs(point.x - maxX) <= tolerance) ||
    (side === "topside" && Math.abs(point.y - maxY) <= tolerance) ||
    (side === "bottomside" && Math.abs(point.y - minY) <= tolerance)

  const nextPinCandidates = nextPinCenter
    ? candidates.filter((side) => isOnSide(nextPinCenter, side))
    : []

  let side: Pin1Side
  if (nextPinCandidates.length === 1) {
    side = nextPinCandidates[0]!
  } else {
    const rankedCandidates = candidates
      .map((candidate) => ({
        side: candidate,
        count: padCenters.filter((point) => isOnSide(point, candidate)).length,
      }))
      .sort((a, b) => b.count - a.count)
    if (
      rankedCandidates.length > 1 &&
      rankedCandidates[0]!.count === rankedCandidates[1]!.count
    ) {
      return null
    }
    side = rankedCandidates[0]!.side
  }

  if (side === "leftside" || side === "rightside") {
    if (spanY <= tolerance) return { side }
    if (pin1Center.y > centerY + tolerance) return { side, alignment: "top" }
    if (pin1Center.y < centerY - tolerance) return { side, alignment: "bottom" }
  } else {
    if (spanX <= tolerance) return { side }
    if (pin1Center.x < centerX - tolerance) return { side, alignment: "left" }
    if (pin1Center.x > centerX + tolerance) return { side, alignment: "right" }
  }

  return null
}

const transformPointField = (value: unknown, transform: FootprintTransform) => {
  if (
    !value ||
    typeof value !== "object" ||
    typeof (value as Point).x !== "number" ||
    typeof (value as Point).y !== "number"
  ) {
    return
  }

  const transformed = transformPoint(value as Point, transform)
  ;(value as Point).x = transformed.x
  ;(value as Point).y = transformed.y
}

const normalizeRotation = (rotation: number) => ((rotation % 360) + 360) % 360

const transformRotation = (rotation: number, transform: FootprintTransform) =>
  normalizeRotation(
    transform.rotation + (transform.mirrored ? -rotation : rotation),
  )

const ANCHOR_ALIGNMENT_POINTS: Record<string, Point> = {
  top_left: { x: -1, y: 1 },
  top_center: { x: 0, y: 1 },
  top_right: { x: 1, y: 1 },
  center_left: { x: -1, y: 0 },
  center: { x: 0, y: 0 },
  center_right: { x: 1, y: 0 },
  bottom_left: { x: -1, y: -1 },
  bottom_center: { x: 0, y: -1 },
  bottom_right: { x: 1, y: -1 },
}

const transformAnchorAlignment = (
  anchorAlignment: unknown,
  transform: FootprintTransform,
) => {
  if (typeof anchorAlignment !== "string") return anchorAlignment
  const point = ANCHOR_ALIGNMENT_POINTS[anchorAlignment]
  if (!point) return anchorAlignment
  const transformed = transformPoint(point, transform)
  return Object.entries(ANCHOR_ALIGNMENT_POINTS).find(
    ([, candidate]) =>
      candidate.x === transformed.x && candidate.y === transformed.y,
  )?.[0]
}

const transformElements = (
  elements: AnyCircuitElement[],
  transform: FootprintTransform,
) => {
  if (transform.rotation === 0 && !transform.mirrored) return elements

  const transformedElements = structuredClone(elements)

  for (const element of transformedElements as any[]) {
    if (typeof element.x === "number" && typeof element.y === "number") {
      const transformed = transformPoint(element, transform)
      element.x = transformed.x
      element.y = transformed.y
    }

    transformPointField(element.center, transform)
    transformPointField(element.anchor_position, transform)

    if (
      typeof element.hole_offset_x === "number" &&
      typeof element.hole_offset_y === "number"
    ) {
      const transformedOffset = transformPoint(
        { x: element.hole_offset_x, y: element.hole_offset_y },
        transform,
      )
      element.hole_offset_x = transformedOffset.x
      element.hole_offset_y = transformedOffset.y
    }

    for (const field of ["route", "outline", "points"] as const) {
      if (!Array.isArray(element[field])) continue
      for (const point of element[field]) {
        transformPointField(point, transform)
      }
    }

    if (
      (element.type === "pcb_smtpad" && element.shape !== "polygon") ||
      element.type === "pcb_plated_hole" ||
      element.type === "pcb_silkscreen_text"
    ) {
      element.ccw_rotation = transformRotation(
        Number(element.ccw_rotation ?? 0),
        transform,
      )
    }

    for (const field of [
      "hole_ccw_rotation",
      "rect_ccw_rotation",
      "text_ccw_rotation",
    ] as const) {
      if (typeof element[field] === "number") {
        element[field] = transformRotation(element[field], transform)
      }
    }

    if (element.anchor_alignment) {
      element.anchor_alignment = transformAnchorAlignment(
        element.anchor_alignment,
        transform,
      )
    }

    if (
      transform.mirrored &&
      (element.type === "pcb_silkscreen_text" ||
        element.type === "pcb_copper_text" ||
        element.type === "pcb_text")
    ) {
      element.is_mirrored = !element.is_mirrored
    }

    if (
      (transform.rotation === 90 || transform.rotation === 270) &&
      (element.type === "pcb_courtyard_rect" ||
        element.type === "pcb_silkscreen_rect" ||
        element.type === "pcb_fabrication_note_rect" ||
        (element.type === "pcb_cutout" && element.shape === "rect"))
    ) {
      ;[element.width, element.height] = [element.height, element.width]
    }

    if (
      (transform.rotation === 90 || transform.rotation === 270) &&
      element.type === "pcb_plated_hole" &&
      element.shape === "circular_hole_with_rect_pad"
    ) {
      ;[element.rect_pad_width, element.rect_pad_height] = [
        element.rect_pad_height,
        element.rect_pad_width,
      ]
    }
  }

  return transformedElements
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
  const nextPin = pads
    .map((pad) => ({ pad, pinNumber: getPinNumber(pad) }))
    .filter(({ pinNumber }) => pinNumber !== null && pinNumber > 1)
    .sort((a, b) => a.pinNumber! - b.pinNumber!)[0]?.pad
  const padCenters = pads.map(getPadCenter).filter((point) => point !== null)
  const pin1Center = pin1 ? getPadCenter(pin1) : null
  const nextPinCenter = nextPin ? getPadCenter(nextPin) : null

  if (!pin1 || !pin1Center || padCenters.length === 0) {
    throw new Error(
      `pin1location(${pin1Location.join(",")}) requires a footprint with a pad whose port_hints contain "1" or "pin1"`,
    )
  }

  const transform = FOOTPRINT_TRANSFORMS.find((candidateTransform) => {
    const transformedPads = padCenters.map((point) =>
      transformPoint(point, candidateTransform),
    )
    const transformedPin1 = transformPoint(pin1Center, candidateTransform)
    const transformedNextPin = nextPinCenter
      ? transformPoint(nextPinCenter, candidateTransform)
      : null
    const inferredLocation = inferPin1Location(
      transformedPads,
      transformedPin1,
      transformedNextPin,
    )
    return (
      inferredLocation?.side === pin1Location[0] &&
      (inferredLocation.alignment === undefined ||
        inferredLocation.alignment === pin1Location[1])
    )
  })

  if (transform === undefined) {
    throw new Error(
      `pin1location(${pin1Location.join(",")}) cannot be inferred from this footprint's pad layout`,
    )
  }

  return transformElements(elements, transform)
}
