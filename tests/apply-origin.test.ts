import { expect, test } from "bun:test"
import { applyOrigin } from "../src/helpers/apply-origin"

test("applyOrigin uses plated hole rectangular pad extents", () => {
  const elements = [
    {
      type: "pcb_smtpad",
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    },
    {
      type: "pcb_plated_hole",
      x: 10,
      y: 0,
      shape: "circular_hole_with_rect_pad",
      rect_pad_width: 4,
      rect_pad_height: 2,
      hole_diameter: 0.8,
    },
  ] as const

  const translated = applyOrigin(JSON.parse(JSON.stringify(elements)), "center")

  const platedHole = translated.find(
    (el) => el.type === "pcb_plated_hole",
  ) as (typeof elements)[1]

  expect(platedHole.x).toBeCloseTo(4.25, 2)
})
