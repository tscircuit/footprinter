import Flatten from "@flatten-js/core"
import type { Point } from "circuit-json"

export type CourtyardSegment = {
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

export function segmentElementsToPolygons(
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
