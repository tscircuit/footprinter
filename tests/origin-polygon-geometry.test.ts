import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { applyOrigin } from "../src/helpers/apply-origin"

const fixture = (): AnyCircuitElement[] => [
  {
    type: "pcb_smtpad",
    pcb_smtpad_id: "rect",
    shape: "rect",
    layer: "top",
    port_hints: ["1"],
    x: 4,
    y: 1,
    width: 2,
    height: 1,
  },
  {
    type: "pcb_smtpad",
    pcb_smtpad_id: "polygon",
    shape: "polygon",
    layer: "top",
    port_hints: ["2"],
    points: [
      { x: -2, y: 2 },
      { x: 0, y: 2 },
      { x: 0, y: 4 },
      { x: -2, y: 4 },
    ],
  },
  {
    type: "pcb_hole",
    pcb_hole_id: "hole",
    hole_shape: "circle",
    hole_diameter: 0.4,
    x: -1,
    y: 3,
  },
  {
    type: "pcb_courtyard_outline",
    pcb_courtyard_outline_id: "body",
    pcb_component_id: "",
    layer: "top",
    outline: [
      { x: -3, y: -1 },
      { x: 6, y: -1 },
      { x: 6, y: 5 },
      { x: -3, y: 5 },
      { x: -3, y: -1 },
    ],
  },
]

test("origin center includes polygon extents and translates pad points, hole and outline", () => {
  const circuit = applyOrigin(fixture(), "center")
  const rectangle = circuit.find(
    (e) => e.type === "pcb_smtpad" && e.shape === "rect",
  )!
  expect(rectangle.x).toBeCloseTo(2.5, 12)
  expect(rectangle.y).toBeCloseTo(-1.25, 12)
  const polygon = circuit.find(
    (e) => e.type === "pcb_smtpad" && e.shape === "polygon",
  )!
  expect(polygon.points).toEqual([
    { x: -3.5, y: -0.25 },
    { x: -1.5, y: -0.25 },
    { x: -1.5, y: 1.75 },
    { x: -3.5, y: 1.75 },
  ])
  expect(circuit.find((e) => e.type === "pcb_hole")).toMatchObject({
    x: -2.5,
    y: 0.75,
  })
  const courtyard = circuit.find((e) => e.type === "pcb_courtyard_outline")!
  expect(courtyard.outline).toEqual([
    { x: -4.5, y: -3.25 },
    { x: 4.5, y: -3.25 },
    { x: 4.5, y: 2.75 },
    { x: -4.5, y: 2.75 },
    { x: -4.5, y: -3.25 },
  ])
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "polygon-origin-center",
  )
})

test("origin bottomleft uses rotated rectangle corners rather than unrotated dimensions", () => {
  const original = fixture()
  original[0] = {
    type: "pcb_smtpad",
    pcb_smtpad_id: "rect",
    shape: "rotated_rect",
    layer: "top",
    port_hints: ["1"],
    x: 2,
    y: -1,
    width: 2,
    height: 1,
    ccw_rotation: 90,
  }
  const circuit = applyOrigin(original, "bottomleft")
  const rectangle = circuit.find(
    (e) => e.type === "pcb_smtpad" && e.shape === "rotated_rect",
  )!
  expect(rectangle.x).toBeCloseTo(4, 12)
  expect(rectangle.y).toBeCloseTo(1, 12)
  const polygon = circuit.find(
    (e) => e.type === "pcb_smtpad" && e.shape === "polygon",
  )!
  expect(polygon.points).toEqual([
    { x: 0, y: 4 },
    { x: 2, y: 4 },
    { x: 2, y: 6 },
    { x: 0, y: 6 },
  ])
  const courtyard = circuit.find((e) => e.type === "pcb_courtyard_outline")!
  expect(courtyard.outline[0]).toEqual({ x: -1, y: 1 })
  expect(convertCircuitJsonToPcbSvg(circuit)).toMatchSvgSnapshot(
    import.meta.path,
    "rotated-rect-polygon-origin-bottomleft",
  )
})

test("origin computes bounds of arbitrary-angle rectangular copper", () => {
  const rotation = 35
  const points = [
    { x: -2, y: -0.5 },
    { x: 2, y: -0.5 },
    { x: 2, y: 0.5 },
    { x: -2, y: 0.5 },
  ].map((point) => ({
    x:
      3 +
      point.x * Math.cos((rotation * Math.PI) / 180) -
      point.y * Math.sin((rotation * Math.PI) / 180),
    y:
      -2 +
      point.x * Math.sin((rotation * Math.PI) / 180) +
      point.y * Math.cos((rotation * Math.PI) / 180),
  }))
  const circuit: AnyCircuitElement[] = [
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "rect",
      shape: "rotated_rect",
      layer: "top",
      port_hints: ["1"],
      x: 3,
      y: -2,
      width: 4,
      height: 1,
      ccw_rotation: rotation,
    },
  ]
  const result = applyOrigin(circuit, "bottomleft")
  const pad = result.find(
    (e) => e.type === "pcb_smtpad" && e.shape === "rotated_rect",
  )!
  expect(pad.x).toBeCloseTo(3 - Math.min(...points.map((p) => p.x)), 12)
  expect(pad.y).toBeCloseTo(-2 - Math.min(...points.map((p) => p.y)), 12)
  expect(convertCircuitJsonToPcbSvg(result)).toMatchSvgSnapshot(
    import.meta.path,
    "rotated-rect-arbitrary-origin-bottomleft",
  )
})
