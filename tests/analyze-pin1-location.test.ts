import { expect, test } from "bun:test"
import type { AnyCircuitElement } from "circuit-json"
import { analyzePin1Location } from "../src"

const createPad = (pinNumber: number, x: number, y: number) =>
  ({
    type: "pcb_smtpad",
    shape: "rect",
    pcb_smtpad_id: `pcb_smtpad_${pinNumber}`,
    x,
    y,
    width: 0.5,
    height: 1,
    layer: "top",
    port_hints: [`pin${pinNumber}`],
  }) as AnyCircuitElement

const rotatePads = (pads: AnyCircuitElement[], rotation: 0 | 90 | 180 | 270) =>
  pads.map((pad) => {
    if (!("x" in pad) || !("y" in pad)) return pad
    const { x, y } = pad
    const center =
      rotation === 90
        ? { x: -y, y: x }
        : rotation === 180
          ? { x: -x, y: -y }
          : rotation === 270
            ? { x: y, y: -x }
            : { x, y }
    return { ...pad, ...center }
  })

test("analyzes all rotations of a two-sided footprint", () => {
  const pads = [
    createPad(1, -2, 1),
    createPad(2, -2, -1),
    createPad(3, 2, -1),
    createPad(4, 2, 1),
  ]

  expect(analyzePin1Location(rotatePads(pads, 0))).toEqual(["leftside", "top"])
  expect(analyzePin1Location(rotatePads(pads, 90))).toEqual([
    "bottomside",
    "left",
  ])
  expect(analyzePin1Location(rotatePads(pads, 180))).toEqual([
    "rightside",
    "bottom",
  ])
  expect(analyzePin1Location(rotatePads(pads, 270))).toEqual([
    "topside",
    "right",
  ])
})

test("uses pin 2 topology to distinguish a reflected corner", () => {
  const pads = [
    createPad(1, -1, 1),
    createPad(2, 1, 1),
    createPad(3, 1, -1),
    createPad(4, -1, -1),
  ]

  expect(analyzePin1Location(pads)).toEqual(["topside", "left"])
})

test("returns null for ambiguous linear footprints and missing pin 1", () => {
  expect(
    analyzePin1Location([createPad(1, -1, 0), createPad(2, 1, 0)]),
  ).toBeNull()
  expect(
    analyzePin1Location([createPad(2, -1, 0), createPad(3, 1, 0)]),
  ).toBeNull()
})
