import { expect } from "bun:test"
import type { AnyCircuitElement, PCBKeepoutRect } from "circuit-json"

type Point = { x: number; y: number }
type Polygon = { points: Point[] }

const contains = (point: Point, polygon: Polygon) => {
  let inside = false
  const points = polygon.points
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const a = points[i]!
    const b = points[j]!
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside
  }
  return inside
}

/** Compare every constant-membership cell delimited by BOTH geometries. */
export const verifyKeepoutUnion = (
  circuit: AnyCircuitElement[],
  polygons: Polygon[],
  area: number,
) => {
  const keepouts = circuit.filter(
    (e): e is PCBKeepoutRect => e.type === "pcb_keepout" && e.shape === "rect",
  )
  const points = polygons.flatMap((p) => p.points)
  const sortedEdges = (values: number[]) =>
    [...new Set(values.map((v) => Number(v.toFixed(12))))].sort((a, b) => a - b)
  const xs = sortedEdges([
    ...points.map(({ x }) => x),
    ...keepouts.flatMap(({ center, width }) => [
      center.x - width / 2,
      center.x + width / 2,
    ]),
  ])
  const ys = sortedEdges([
    ...points.map(({ y }) => y),
    ...keepouts.flatMap(({ center, height }) => [
      center.y - height / 2,
      center.y + height / 2,
    ]),
  ])
  let computedArea = 0
  for (let i = 1; i < xs.length; i++) {
    for (let j = 1; j < ys.length; j++) {
      const point = {
        x: (xs[i - 1]! + xs[i]!) / 2,
        y: (ys[j - 1]! + ys[j]!) / 2,
      }
      const source = polygons.some((p) => contains(point, p))
      const generated = keepouts.some(
        ({ center, width, height }) =>
          Math.abs(point.x - center.x) < width / 2 &&
          Math.abs(point.y - center.y) < height / 2,
      )
      expect(generated).toBe(source)
      if (source) computedArea += (xs[i]! - xs[i - 1]!) * (ys[j]! - ys[j - 1]!)
    }
  }
  expect(computedArea).toBeCloseTo(area, 10)
  expect(keepouts.reduce((sum, k) => sum + k.width * k.height, 0)).toBeCloseTo(
    area,
    10,
  )
}

export const verifyCopperDisjoint = (circuit: AnyCircuitElement[]) => {
  const keepouts = circuit.filter(
    (e): e is PCBKeepoutRect => e.type === "pcb_keepout" && e.shape === "rect",
  )
  const pads = circuit.filter((e) => e.type === "pcb_smtpad")
  for (const pad of pads) {
    if (pad.shape !== "rect" && pad.shape !== "rotated_rect")
      throw new Error("expected rectangular land")
    const swap = pad.shape === "rotated_rect" && pad.ccw_rotation % 180 !== 0
    const width = swap ? pad.height : pad.width
    const height = swap ? pad.width : pad.height
    for (const keepout of keepouts) {
      const overlapWidth = Math.max(
        0,
        Math.min(pad.x + width / 2, keepout.center.x + keepout.width / 2) -
          Math.max(pad.x - width / 2, keepout.center.x - keepout.width / 2),
      )
      const overlapHeight = Math.max(
        0,
        Math.min(pad.y + height / 2, keepout.center.y + keepout.height / 2) -
          Math.max(pad.y - height / 2, keepout.center.y - keepout.height / 2),
      )
      expect(overlapWidth * overlapHeight).toBeCloseTo(0, 10)
    }
  }
}

export const rotatePoint = ({ x, y }: Point, angle: number): Point => {
  if (angle === 90) return { x: -y, y: x }
  if (angle === 180) return { x: -x, y: -y }
  if (angle === 270) return { x: y, y: -x }
  return { x, y }
}
