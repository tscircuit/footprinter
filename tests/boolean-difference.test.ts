import { expect, test } from "bun:test"
import { createBooleanDifferenceVisualization } from "../src/helpers/boolean-difference"

test("boolean difference preserves rounded SMT pad corners", () => {
  const svg = createBooleanDifferenceVisualization(
    [
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: 0,
        y: 0,
        width: 1,
        height: 0.5,
        corner_radius: 0.1,
      },
    ],
    [
      {
        type: "pcb_smtpad",
        shape: "rect",
        x: 0,
        y: 0,
        width: 1,
        height: 0.5,
        corner_radius: 0.1,
      },
    ],
  )

  expect(svg).toContain("A0.1,0.1")
})

test("boolean difference renders circular SMT pads as circles", () => {
  const svg = createBooleanDifferenceVisualization(
    [
      {
        type: "pcb_smtpad",
        shape: "circle",
        x: 0,
        y: 0,
        radius: 0.5,
      },
    ],
    [
      {
        type: "pcb_smtpad",
        shape: "circle",
        x: 0,
        y: 0,
        radius: 0.5,
      },
    ],
  )

  expect(svg).toContain("A0.5,0.5")
})
