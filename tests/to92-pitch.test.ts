import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("to92_inline_pitch2.54mm aligns holes for perfboard", () => {
  const cj = fp.string("to92_inline_pitch2.54mm").circuitJson()
  const holes = cj
    .filter((e: any) => e.type === "pcb_plated_hole")
    .map((h: any) => ({ x: h.x, y: h.y }))
  // Los 3 agujeros deben estar en linea recta (misma y) separados 2.54mm
  expect(holes[0].y).toBeCloseTo(holes[1].y, 5)
  expect(holes[1].y).toBeCloseTo(holes[2].y, 5)
  expect(holes[2].x - holes[0].x).toBeCloseTo(5.08, 2) // 2 * 2.54
})
