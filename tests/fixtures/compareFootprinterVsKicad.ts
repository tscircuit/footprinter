import Flatten from "@flatten-js/core"
import { transformPcbElements } from "@tscircuit/circuit-json-util"
import { translate } from "transformation-matrix"
import { fp } from "src/footprinter"
import type { PcbPlatedHole, PcbSilkscreenText } from "circuit-json"
import { createBooleanDifferenceVisualization } from "../../src/helpers/boolean-difference"

type PcbSmtPad = {
  type: "pcb_smtpad"
  x: number
  y: number
  width: number
  height: number
  port_hints?: string[]
  shape?: string
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
    footprinterCourtyards
      .map(courtyardElementToPolygon)
      .filter((polygon): polygon is Flatten.Polygon => polygon !== null),
  )
  const kicadPolygon = unionPolygons(
    kicadCourtyards
      .map(courtyardElementToPolygon)
      .filter((polygon): polygon is Flatten.Polygon => polygon !== null),
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
  if ("width" in elm) return elm.width
  if (elm.shape === "circle") return elm.outer_diameter
  if (elm.shape === "circular_hole_with_rect_pad") return elm.rect_pad_width

  return 0
}
function getHeight(elm: PcbSmtPad | PcbPlatedHole): number {
  if ("height" in elm) return elm.height
  if (elm.shape === "circle") return elm.outer_diameter
  if (elm.shape === "circular_hole_with_rect_pad") return elm.rect_pad_height

  return 0
}
function getArea(elm: PcbSmtPad | PcbPlatedHole): number {
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

function getPadsAndHolesCenter(elements: (PcbSmtPad | PcbPlatedHole)[]): Point {
  const maxX = Math.max(...elements.map((e) => e.x))
  const minX = Math.min(...elements.map((e) => e.x))
  const maxY = Math.max(...elements.map((e) => e.y))
  const minY = Math.min(...elements.map((e) => e.y))

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
<<<<<<< HEAD
  const referenceCenter = getPadsAndHolesCenter(referencePadsAndHoles)
  const kicadCenter = getPadsAndHolesCenter(kicadPadsAndHoles)
  const normalizedKicadCourtyardElements = translateCourtyardElements(
    kicadCourtyardElements,
    referenceCenter.x - kicadCenter.x,
    referenceCenter.y - kicadCenter.y,
  )
  const { courtyardDiffPercent, courtyardIntersectionOverUnionPercent } =
    getCourtyardMetrics(fpCourtyardElements, normalizedKicadCourtyardElements)
=======
  const { courtyardDiffPercent, courtyardIntersectionOverUnionPercent } =
    getCourtyardMetrics(fpCourtyardElements, kicadCourtyardElements)
>>>>>>> 8abf343 (Define explicit courtyards and report parity courtyard overlap)

  console.log(
    `📐 ${normalizedFootprintName} courtyard IoU: ${courtyardIntersectionOverUnionPercent.toFixed(2)}% (diff ${courtyardDiffPercent.toFixed(2)}%)`,
  )

  // Pitch detection
  if (diffPercent > 0 && kicadPadsAndHoles.length >= 2) {
    const horizontal = kicadPadsAndHoles.every(
      (item) => item.y === kicadPadsAndHoles[0]!.y,
    )
    const sorted = [...kicadPadsAndHoles].sort((a, b) =>
      horizontal ? a.x - b.x : a.y - b.y,
    )
    const pitches: number[] = []
    for (let i = 1; i < sorted.length; i++) {
      pitches.push(
        horizontal
          ? sorted[i]!.x - sorted[i - 1]!.x
          : sorted[i]!.y - sorted[i - 1]!.y,
      )
    }
    const avgPitch = pitches.reduce((a, b) => a + b, 0) / pitches.length
    console.log(
      `📏 ${horizontal ? "Horizontal" : "Vertical"} pad/hole pitch: ${avgPitch}`,
    )
    // Consolidate pad dimension logs: if all pads share same size, log once
    if (kicadPads.length > 0) {
      const padDimKey = (p: PcbSmtPad) => `${p.width}x${p.height}`
      const uniquePadDims = new Set(kicadPads.map(padDimKey))
      if (uniquePadDims.size === 1) {
        const p = kicadPads[0]!
        console.log(
          `🔹 KiCad Pads - width: ${p.width}, height: ${p.height} (all ${kicadPads.length})`,
        )
      } else {
        for (const pad of kicadPads) {
          console.log(
            `🔹 KiCad Pad - width: ${pad.width}, height: ${pad.height}`,
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
      e.type === "pcb_courtyard_polygon",
  )

  // Figure out how far to shift KiCad elements
  const refMaxX = Math.max(
    ...referencePadsAndHoles.map((e) => e.x + getWidth(e) / 2),
  )
  const refMinX = Math.min(
    ...referencePadsAndHoles.map((e) => e.x - getWidth(e) / 2),
  )
  const refWidth = refMaxX - refMinX

  // Calculate vertical center positions for alignment
  const refMaxY = Math.max(
    ...referencePadsAndHoles.map((e) => e.y + getHeight(e) / 2),
  )
  const refMinY = Math.min(
    ...referencePadsAndHoles.map((e) => e.y - getHeight(e) / 2),
  )
  const refCenterY = (refMaxY + refMinY) / 2

  const kicadPadsAndHolesForAlignment = kicadElements.filter(
    (e) => e.type === "pcb_smtpad" || e.type === "pcb_plated_hole",
  )
  const kicadMaxY = Math.max(
    ...kicadPadsAndHolesForAlignment.map((e) => e.y + getHeight(e) / 2),
  )
  const kicadMinY = Math.min(
    ...kicadPadsAndHolesForAlignment.map((e) => e.y - getHeight(e) / 2),
  )
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
