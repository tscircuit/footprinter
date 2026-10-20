import { expect, test } from "bun:test"
import * as footprints from "../src/fn"
import { fp } from "../src/footprinter"

const throughHolePackages = [
  [
    "to92",
    { num_pins: 3, inline: false },
    { p: 1.27, id: 0.72, od: 0.95, w: 4.5, h: 4.5 },
  ],
  [
    "to92",
    { num_pins: 3, inline: true },
    { p: 1.27, id: 0.72, od: 0.95, w: 4.5, h: 4.5 },
  ],
  [
    "to92",
    { num_pins: 2, inline: false },
    { p: 1.27, id: 0.72, od: 0.95, w: 4.5, h: 4.5 },
  ],
  [
    "to92l",
    { num_pins: 3, inline: false },
    { p: 1.27, id: 0.75, od: 1.3, w: 4.8, h: 4 },
  ],
  [
    "to92l",
    { num_pins: 3, inline: true },
    { p: 1.27, id: 0.75, od: 1.3, w: 4.8, h: 4 },
  ],
  ["to92s", { num_pins: 3 }, { p: 1.27, id: 0.72, od: 0.95, w: 2.5, h: 4.2 }],
  ["to92s", { num_pins: 2 }, { p: 1.27, id: 0.72, od: 0.95, w: 2.5, h: 4.2 }],
  [
    "potentiometer",
    { num_pins: 3 },
    { p: 5, id: 1.25, od: 2.35, ca: 14, w: 5.35, h: 4 },
  ],
] as const

test.each(throughHolePackages)(
  "%s (%o) preserves its plated-hole land pattern across length units",
  (name, options, defaults) => {
    const baseline = (footprints as any)[name]({
      fn: name,
      ...options,
      string: `${name}_${options.num_pins}`,
    }).circuitJson
    const baselineHoles = baseline.filter(
      (element: any) => element.type === "pcb_plated_hole",
    )

    for (const [unit, millimetersPerUnit] of [
      ["mil", 0.0254],
      ["in", 25.4],
      ["mm", 1],
      ["", 1],
    ] as const) {
      const convertedParams: Record<string, unknown> = {
        fn: name,
        ...options,
        string: `${name}_${options.num_pins}`,
      }
      for (const [key, value] of Object.entries(defaults)) {
        convertedParams[key] = `${value / millimetersPerUnit}${unit}`
      }

      const circuitJson = (footprints as any)[name](convertedParams).circuitJson
      const holes = circuitJson.filter(
        (element: any) => element.type === "pcb_plated_hole",
      )

      expect(holes).toHaveLength(baselineHoles.length)
      for (const [index, hole] of holes.entries()) {
        const expected = baselineHoles[index]!
        expect(hole.shape).toBe(expected.shape)
        expect(hole.x).toBeCloseTo(expected.x, 8)
        expect(hole.y).toBeCloseTo(expected.y, 8)
        if ("hole_diameter" in expected && "hole_diameter" in hole) {
          expect(hole.hole_diameter).toBeCloseTo(expected.hole_diameter, 8)
        }
        if ("outer_diameter" in expected && "outer_diameter" in hole) {
          expect(hole.outer_diameter).toBeCloseTo(expected.outer_diameter, 8)
        }
        if ("hole_width" in expected && "hole_width" in hole) {
          expect(hole.hole_width).toBeCloseTo(expected.hole_width, 8)
          expect(hole.hole_height).toBeCloseTo(expected.hole_height, 8)
          expect(hole.outer_width).toBeCloseTo(expected.outer_width, 8)
          expect(hole.outer_height).toBeCloseTo(expected.outer_height, 8)
        }
        if ("rect_pad_width" in expected && "rect_pad_width" in hole) {
          expect(hole.rect_pad_width).toBeCloseTo(expected.rect_pad_width, 8)
          expect(hole.rect_pad_height).toBeCloseTo(expected.rect_pad_height, 8)
        }
      }
    }
  },
)

test("to92l_inline_id30mil_p100mil converts drill and pitch consistently across all pins", () => {
  const holes = fp
    .string("to92l_inline_id30mil_p100mil")
    .circuitJson()
    .filter((element) => element.type === "pcb_plated_hole")

  expect(holes).toHaveLength(3)
  expect(holes[0]).toMatchObject({
    x: 0,
    y: 0,
    hole_diameter: expect.closeTo(0.762, 8),
  })
  expect(holes[1]).toMatchObject({
    x: expect.closeTo(2.54, 8),
    y: 0,
    hole_width: expect.closeTo(0.762, 8),
  })
  expect(holes[2]).toMatchObject({
    x: expect.closeTo(5.08, 8),
    y: 0,
    hole_width: expect.closeTo(0.762, 8),
  })
})
