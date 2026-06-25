import Flatten from "@flatten-js/core"
import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"
import type { PcbPlatedHole, PcbSilkscreenText } from "circuit-json"
import { createBooleanDifferenceVisualization } from "../../src/helpers/boolean-difference"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x?: number
  y?: number
  width?: number
  height?: number
  port_hints?: string[]
  shape?: string
  points?: Point[]
}

type Point = {
  x: number
  y: number
}

type CourtyardElement = {
  type:
    | "pcb_courtyard_rect"
    | "pcb_courtyard_outline"
    | "pcb_courtyard_circle"
    | "pcb_courtyard_polygon"
  center?: Point
  width?: number
  height?: number
  radius?: number
  diameter?: number
  outline?: Point[]
  points?: Point[]
}

type CourtyardSegment = {
  start: Point
  end: Point
}

const POINT_TOLERANCE = 1e-6

function pointsEqual(a: Point, b: Point): boolean {
  return (
    Math.abs(a.x - b.x) <= POINT_TOLERANCE &&
    Math.abs(a.y - b.y) <= POINT_TOLERANCE
  )
}

function signedPolygonArea(points: Point[]): number {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const current = points[i]!
    const next = points[(i + 1) % points.length]!
    area += current.x * next.y - next.x * current.y
  }
  return area / 2
}

function normalizePolygonWinding(points: Point[]): Point[] {
  return signedPolygonArea(points) < 0 ? [...points].reverse() : points
}

function courtyardElementToPolygon(
  element: CourtyardElement,
): Flatten.Polygon | null {
  if (
    element.type === "pcb_courtyard_rect" &&
    element.center &&
    element.width !== undefined &&
    element.height !== undefined
  ) {
    const halfWidth = element.width / 2
    const halfHeight = element.height / 2
    return new Flatten.Polygon([
      [element.center.x - halfWidth, element.center.y - halfHeight],
      [element.center.x + halfWidth, element.center.y - halfHeight],
      [element.center.x + halfWidth, element.center.y + halfHeight],
      [element.center.x - halfWidth, element.center.y + halfHeight],
    ])
  }

  if (
    (element.type === "pcb_courtyard_outline" ||
      element.type === "pcb_courtyard_polygon") &&
    element.outline &&
    element.outline.length >= 3
  ) {
    const normalizedPoints = normalizePolygonWinding(element.outline)
    return new Flatten.Polygon(
      normalizedPoints.map((point) => [point.x, point.y]),
    )
  }

  if (
    element.type === "pcb_courtyard_polygon" &&
    element.points &&
    element.points.length >= 3
  ) {
    const normalizedPoints = normalizePolygonWinding(element.points)
    return new Flatten.Polygon(
      normalizedPoints.map((point) => [point.x, point.y]),
    )
  }

  if (element.type === "pcb_courtyard_circle" && element.center) {
    const radius =
      element.radius ??
      (element.diameter !== undefined ? element.diameter / 2 : undefined)
    if (radius !== undefined) {
      return new Flatten.Polygon(
        new Flatten.Circle(
          new Flatten.Point(element.center.x, element.center.y),
          radius,
        ),
      )
    }
  }

  return null
}

function pointsToBoundingBoxPolygon(points: Point[]): Flatten.Polygon | null {
  if (points.length === 0) return null

  const minX = Math.min(...points.map((point) => point.x))
  const maxX = Math.max(...points.map((point) => point.x))
  const minY = Math.min(...points.map((point) => point.y))
  const maxY = Math.max(...points.map((point) => point.y))

  if (minX === maxX || minY === maxY) return null

  return new Flatten.Polygon([
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ])
}

function segmentElementsToPolygons(
  segments: CourtyardSegment[],
): Flatten.Polygon[] {
  const remaining = [...segments]
  const polygons: Flatten.Polygon[] = []

  while (remaining.length > 0) {
    const first = remaining.shift()!
    const route = [first.start, first.end]

    while (!pointsEqual(route[route.length - 1]!, route[0]!)) {
      const routeEnd = route[route.length - 1]!
      const nextSegmentIndex = remaining.findIndex(
        (segment) =>
          pointsEqual(segment.start, routeEnd) ||
          pointsEqual(segment.end, routeEnd),
      )

      if (nextSegmentIndex === -1) break

      const [nextSegment] = remaining.splice(nextSegmentIndex, 1)
      route.push(
        pointsEqual(nextSegment!.start, routeEnd)
          ? nextSegment!.end
          : nextSegment!.start,
      )
    }

    if (route.length >= 4 && pointsEqual(route[route.length - 1]!, route[0]!)) {
      const closedRoute = route.slice(0, -1)
      const normalizedPoints = normalizePolygonWinding(closedRoute)
      polygons.push(
        new Flatten.Polygon(
          normalizedPoints.map((point) => [point.x, point.y]),
        ),
      )
    }
  }

  if (polygons.length === 0) {
    const boundingBoxPolygon = pointsToBoundingBoxPolygon(
      segments.flatMap((segment) => [segment.start, segment.end]),
    )
    if (boundingBoxPolygon) polygons.push(boundingBoxPolygon)
  }

  return polygons
}

function courtyardElementsToPolygons(
  elements: CourtyardElement[],
): Flatten.Polygon[] {
  const polygons: Flatten.Polygon[] = []
  const segments: CourtyardSegment[] = []

  for (const element of elements) {
    const polygon = courtyardElementToPolygon(element)
    if (polygon) {
      polygons.push(polygon)
      continue
    }

    if (
      element.type === "pcb_courtyard_outline" &&
      element.outline?.length === 2
    ) {
      segments.push({
        start: element.outline[0]!,
        end: element.outline[1]!,
      })
    }
  }

  return [...polygons, ...segmentElementsToPolygons(segments)]
}

function unionPolygons(polygons: Flatten.Polygon[]): Flatten.Polygon | null {
  if (polygons.length === 0) return null

  let union = polygons[0]!
  for (let i = 1; i < polygons.length; i++) {
    union = Flatten.BooleanOperations.unify(union, polygons[i]!)
  }

  return union
}

function getCourtyardMetrics(
  footprinterCourtyards: CourtyardElement[],
  kicadCourtyards: CourtyardElement[],
) {
  if (footprinterCourtyards.length === 0) {
    throw new Error("Footprinter output is missing an explicit courtyard")
  }
  if (kicadCourtyards.length === 0) {
    throw new Error("KiCad footprint is missing a courtyard")
  }

  const fpPolygon = unionPolygons(
    courtyardElementsToPolygons(footprinterCourtyards),
  )
  const kicadPolygon = unionPolygons(
    courtyardElementsToPolygons(kicadCourtyards),
  )

  if (!fpPolygon || !kicadPolygon) {
    throw new Error("Could not convert courtyard geometry into polygons")
  }

  const intersection = Flatten.BooleanOperations.intersect(
    fpPolygon,
    kicadPolygon,
  )
  const fpArea = Math.abs(fpPolygon.area())
  const kicadArea = Math.abs(kicadPolygon.area())
  const intersectionArea = Math.abs(intersection.area())
  const unionArea = fpArea + kicadArea - intersectionArea

  if (unionArea === 0) {
    throw new Error("Courtyard union area is zero")
  }

  const intersectionOverUnion = intersectionArea / unionArea

  return {
    courtyardIntersectionArea: intersectionArea,
    courtyardUnionArea: unionArea,
    courtyardIntersectionOverUnionPercent: intersectionOverUnion * 100,
    courtyardDiffPercent: (1 - intersectionOverUnion) * 100,
  }
}

// --- Helpers to handle both pads & holes safely ---
function getWidth(elm: PcbSmtPad | PcbPlatedHole): number {
  if (elm.type === "pcb_smtpad" && elm.shape === "polygon" && elm.points) {
    return (
      Math.max(...elm.points.map((point) => point.x)) -
      Math.min(...elm.points.map((point) => point.x))
    )
  }
  if ("width" in elm && elm.width !== undefined) return elm.width
  if (elm.shape === "circle") return elm.outer_diameter
  if (elm.shape === "circular_hole_with_rect_pad") return elm.rect_pad_width

  return 0
}
function getHeight(elm: PcbSmtPad | PcbPlatedHole): number {
  if (elm.type === "pcb_smtpad" && elm.shape === "polygon" && elm.points) {
    return (
      Math.max(...elm.points.map((point) => point.y)) -
      Math.min(...elm.points.map((point) => point.y))
    )
  }
  if ("height" in elm && elm.height !== undefined) return elm.height
  if (elm.shape === "circle") return elm.outer_diameter
  if (elm.shape === "circular_hole_with_rect_pad") return elm.rect_pad_height

  return 0
}
function getArea(elm: PcbSmtPad | PcbPlatedHole): number {
  if (elm.type === "pcb_smtpad" && elm.shape === "polygon" && elm.points) {
    return Math.abs(signedPolygonArea(elm.points))
  }
  if (elm.type === "pcb_plated_hole" && elm.shape === "circle") {
    const outerRadius = elm.outer_diameter / 2
    const innerRadius = elm.hole_diameter / 2
    // Plated area = outer circle - inner circle (annular ring)
    return Math.PI * (outerRadius * outerRadius - innerRadius * innerRadius)
  }
  if (
    elm.type === "pcb_plated_hole" &&
    elm.shape === "circular_hole_with_rect_pad"
  ) {
    const rectArea = elm.rect_pad_width * elm.rect_pad_height
    const holeRadius = elm.hole_diameter / 2
    const holeArea = Math.PI * holeRadius * holeRadius
    return Math.max(rectArea - holeArea, 0)
  }
  return getWidth(elm) * getHeight(elm)
}

function getElementCenter(element: PcbSmtPad | PcbPlatedHole): Point {
  if (
    element.type === "pcb_smtpad" &&
    element.shape === "polygon" &&
    element.points &&
    element.points.length > 0
  ) {
    const maxX = Math.max(...element.points.map((point) => point.x))
    const minX = Math.min(...element.points.map((point) => point.x))
    const maxY = Math.max(...element.points.map((point) => point.y))
    const minY = Math.min(...element.points.map((point) => point.y))

    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2,
    }
  }

  return {
    x: element.x ?? 0,
    y: element.y ?? 0,
  }
}

function getElementBounds(element: PcbSmtPad | PcbPlatedHole) {
  const center = getElementCenter(element)
  const halfWidth = getWidth(element) / 2
  const halfHeight = getHeight(element) / 2

  return {
    minX: center.x - halfWidth,
    maxX: center.x + halfWidth,
    minY: center.y - halfHeight,
    maxY: center.y + halfHeight,
  }
}

function getPadsAndHolesCenter(elements: (PcbSmtPad | PcbPlatedHole)[]): Point {
  const bounds = elements.map(getElementBounds)
  const maxX = Math.max(...bounds.map((bound) => bound.maxX))
  const minX = Math.min(...bounds.map((bound) => bound.minX))
  const maxY = Math.max(...bounds.map((bound) => bound.maxY))
  const minY = Math.min(...bounds.map((bound) => bound.minY))

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  }
}

function translateCourtyardElements(
  courtyards: CourtyardElement[],
  dx: number,
  dy: number,
): CourtyardElement[] {
  return courtyards.map((courtyard) => ({
    ...courtyard,
    center: courtyard.center
      ? { x: courtyard.center.x + dx, y: courtyard.center.y + dy }
      : courtyard.center,
    outline: courtyard.outline?.map((p) => ({ x: p.x + dx, y: p.y + dy })),
    points: courtyard.points?.map((p) => ({ x: p.x + dx, y: p.y + dy })),
  }))
}

export async function compareFootprinterVsKicad(
  footprinterString: string,
  kicadPath: string,
  options: {
    includeSilkscreen?: boolean
  } = { includeSilkscreen: true },
): Promise<{
  avgRelDiff: number
  combinedFootprintElements: any[]
  booleanDifferenceSvg: string
  courtyardDiffPercent: number
  courtyardIntersectionOverUnionPercent: number
  fpSilkscreenElements: any[]
}> {
  const BASE_URL = "https://kicad-mod-cache.tscircuit.com/"
  const kicadUrl = BASE_URL + kicadPath
  const normalizedFootprintName =
    kicadPath.split("/").pop()?.replace(".circuit.json", "") ?? "unknown"

  const res = await fetch(kicadUrl)
  if (!res.ok)
    throw new Error(`Failed to fetch ${normalizedFootprintName}: ${res.status}`)

  const kicadCircuitJson = (await res.json()) as any[]

  const kicadPads = kicadCircuitJson.filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]
  const kicadHoles = kicadCircuitJson.filter(
    (e) => e.type === "pcb_plated_hole",
  ) as PcbPlatedHole[]

  // Combine KiCad pads and holes for calculations
  const kicadPadsAndHoles = [...kicadPads, ...kicadHoles]
  const kicadArea = kicadPadsAndHoles.reduce(
    (sum, item) => sum + getArea(item),
    0,
  )

  const fpCircuitJson = fp.string(footprinterString).circuitJson()
  const fpCourtyardElements = fpCircuitJson.filter(
    (e) =>
      e.type === "pcb_courtyard_outline" ||
      e.type === "pcb_courtyard_rect" ||
      e.type === "pcb_courtyard_circle" ||
      e.type === "pcb_courtyard_polygon",
  ) as CourtyardElement[]
  const kicadCourtyardElements = kicadCircuitJson.filter(
    (e) =>
      e.type === "pcb_courtyard_outline" ||
      e.type === "pcb_courtyard_rect" ||
      e.type === "pcb_courtyard_circle" ||
      e.type === "pcb_courtyard_polygon",
  ) as CourtyardElement[]

  const referencePads = (fpCircuitJson as any[]).filter(
    (e) => e.type === "pcb_smtpad",
  ) as PcbSmtPad[]
  const referenceHoles = (fpCircuitJson as any[]).filter(
    (e) => e.type === "pcb_plated_hole",
  ) as PcbPlatedHole[]

  const referencePadsAndHoles = [...referencePads, ...referenceHoles]
  const refArea = referencePadsAndHoles.reduce(
    (sum, item) => sum + getArea(item),
    0,
  )

  const avgRelDiff = Math.abs(refArea - kicadArea) / (refArea + kicadArea) || 0
  const diffPercent = avgRelDiff * 100
  const referenceCenter = getPadsAndHolesCenter(referencePadsAndHoles)
  const kicadCenter = getPadsAndHolesCenter(kicadPadsAndHoles)
  const normalizedKicadCourtyardElements = translateCourtyardElements(
    kicadCourtyardElements,
    referenceCenter.x - kicadCenter.x,
    referenceCenter.y - kicadCenter.y,
  )
  const { courtyardDiffPercent, courtyardIntersectionOverUnionPercent } =
    getCourtyardMetrics(fpCourtyardElements, normalizedKicadCourtyardElements)

  console.log(
    `📐 ${normalizedFootprintName} courtyard IoU: ${courtyardIntersectionOverUnionPercent.toFixed(2)}% (diff ${courtyardDiffPercent.toFixed(2)}%)`,
  )

  // Pitch detection
  if (diffPercent > 0 && kicadPadsAndHoles.length >= 2) {
    const horizontal = kicadPadsAndHoles.every(
      (item) =>
        getElementCenter(item).y === getElementCenter(kicadPadsAndHoles[0]!).y,
    )
    const sorted = [...kicadPadsAndHoles].sort((a, b) =>
      horizontal
        ? getElementCenter(a).x - getElementCenter(b).x
        : getElementCenter(a).y - getElementCenter(b).y,
    )
    const pitches: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      pitches.push(
        horizontal
          ? getElementCenter(sorted[i]!).x - getElementCenter(sorted[i - 1]!).x
          : getElementCenter(sorted[i]!).y - getElementCenter(sorted[i - 1]!).y,
      )
    }
    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
    console.log(
      `📏 ${horizontal ? "Horizontal" : "Vertical"} pad/hole pitch: ${avgPitch}`,
    )
    // Consolidate pad dimension logs: if all pads share same size, log once
    if (kicadPads.length > 0) {
      const padDimKey = (p: PcbSmtPad) => `${getWidth(p)}x${getHeight(p)}`
      const uniquePadDims = new Set(kicadPads.map(padDimKey))
      if (uniquePadDims.size === 1) {
        const p = kicadPads[0]!
        console.log(
          `🔹 KiCad Pads - width: ${getWidth(p)}, height: ${getHeight(p)} (all ${kicadPads.length})`,
        )
      } else {
        for (const pad of kicadPads) {
          console.log(
            `🔹 KiCad Pad - width: ${getWidth(pad)}, height: ${getHeight(pad)}`,
          )
        }
      }
    }

    // Consolidate plated hole logs: if all holes share same inner/outer diameters, log once
    if (kicadHoles.length > 0) {
      const holeDimKey = (h: PcbPlatedHole) =>
        h.shape === "circle"
          ? `circle:${h.outer_diameter}/${h.hole_diameter}`
          : `${h.shape}:N/A/N/A`
      const uniqueHoleDims = new Set(kicadHoles.map(holeDimKey))
      if (uniqueHoleDims.size === 1) {
        const h = kicadHoles[0]!
        const outer = h.shape === "circle" ? h.outer_diameter : "N/A"
        const inner = h.shape === "circle" ? h.hole_diameter : "N/A"
        console.log(
          `⚪ KiCad Plated Holes - outer: ${outer}, inner: ${inner} (all ${kicadHoles.length})`,
        )
      } else {
        for (const hole of kicadHoles) {
          console.log(
            `⚪ KiCad Plated Hole - outer: ${
              hole.shape === "circle" ? hole.outer_diameter : "N/A"
            }, inner: ${hole.shape === "circle" ? hole.hole_diameter : "N/A"}`,
          )
        }
      }
    }
  }

  const kicadElements = kicadCircuitJson.filter(
    (e) =>
      e.type === "pcb_smtpad" ||
      e.type === "pcb_component" ||
      e.type === "pcb_plated_hole" ||
      e.type === "pcb_courtyard_outline" ||
      e.type === "pcb_courtyard_rect" ||
      e.type === "pcb_courtyard_circle" ||
      e.type === "pcb_courtyard_polygon" ||
      (options.includeSilkscreen === true &&
        (e.type === "pcb_silkscreen_path" || e.type === "pcb_silkscreen_text")),
  )

  // Figure out how far to shift KiCad elements
  const referenceBounds = referencePadsAndHoles.map(getElementBounds)
  const refMaxX = Math.max(...referenceBounds.map((bound) => bound.maxX))
  const refMinX = Math.min(...referenceBounds.map((bound) => bound.minX))
  const refWidth = refMaxX - refMinX

  // Calculate vertical center positions for alignment
  const refMaxY = Math.max(...referenceBounds.map((bound) => bound.maxY))
  const refMinY = Math.min(...referenceBounds.map((bound) => bound.minY))
  const refCenterY = (refMaxY + refMinY) / 2

  const kicadPadsAndHolesForAlignment = kicadElements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  const kicadAlignmentBounds =
    kicadPadsAndHolesForAlignment.map(getElementBounds)
  const kicadMaxY = Math.max(...kicadAlignmentBounds.map((bound) => bound.maxY))
  const kicadMinY = Math.min(...kicadAlignmentBounds.map((bound) => bound.minY))
  const kicadCenterY = (kicadMaxY + kicadMinY) / 2

  const areaGapFactor = 1
  const dynamicExtraGap = Math.sqrt((refArea + kicadArea) * areaGapFactor)
  const dynamicGap = refWidth + dynamicExtraGap
  const verticalAlignment = refCenterY - kicadCenterY

  const transformedKiCad = transformPcbElements(
    kicadElements,
    translate(dynamicGap, verticalAlignment),
  )

  // Bounding box for both sets
  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  for (const elm of [...fpCircuitJson, ...transformedKiCad]) {
    if (
      (elm.type === "pcb_smtpad" && elm.shape === "rect") ||
      (elm.type === "pcb_plated_hole" && elm.shape === "circle") ||
      (elm.type === "pcb_plated_hole" &&
        elm.shape === "circular_hole_with_rect_pad")
    ) {
      const radiusX = getWidth(elm) / 2
      const radiusY = getHeight(elm) / 2
      minX = Math.min(minX, elm.x - radiusX)
      maxX = Math.max(maxX, elm.x + radiusX)
      minY = Math.min(minY, elm.y - radiusY)
      maxY = Math.max(maxY, elm.y + radiusY)
    }
  }

  const midX = (minX + maxX) / 2

  const diffPercentText: PcbSilkscreenText = {
    type: "pcb_silkscreen_text",
    pcb_silkscreen_text_id: "diffPercentText",
    pcb_component_id: "",
    font: "tscircuit2024",
    font_size: 0.3,
    text: `Diff: ${diffPercent.toFixed(2)}%`,
    layer: "top",
    anchor_position: { x: midX, y: -maxY - 1 },
    anchor_alignment: "center",
    ccw_rotation: 0,
    is_mirrored: false,
  }

  const combinedFootprintElements = [
    ...fpCircuitJson,
    ...transformedKiCad,
    diffPercentText,
  ]

  // Parse out silkscreen elements separately (not included in boolean diff)
  const fpSilkscreenElements = fpCircuitJson.filter(
    (e) => e.type === "pcb_silkscreen_path" || e.type === "pcb_silkscreen_text",
  )

  // Generate boolean difference visualization for alignment analysis
  // Only include pads and holes (not silkscreen) for precise alignment comparison
  const fpFootprintElements = fpCircuitJson.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )

  // CRITICAL: Use the original KiCad elements BEFORE transformation
  // The kicadElements above are filtered but not yet transformed
  // This ensures true overlay positioning for alignment analysis
  const originalKicadFootprintElements = kicadElements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )

  const booleanDifferenceSvg = createBooleanDifferenceVisualization(
    fpFootprintElements,
    originalKicadFootprintElements,
    {
      title: `${normalizedFootprintName} - Alignment Analysis (Footprinter vs KiCad)`,
      operation: "intersection",
      colorA: "#dc3545", // Footprinter in red
      colorB: "#007bff", // KiCad in blue
      colorDifference: "#ffc107", // Overlap in yellow
      showLegend: true,
      footprintNameA: footprinterString,
      footprintNameB: normalizedFootprintName,
    },
  )

  return {
    avgRelDiff,
    combinedFootprintElements,
    booleanDifferenceSvg,
    courtyardDiffPercent,
    courtyardIntersectionOverUnionPercent,
    fpSilkscreenElements,
  }
}
