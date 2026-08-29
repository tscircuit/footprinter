import { test, expect } from "bun:test"
import { fp } from "src/footprinter"

const segmentToPadClearance = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  pad: { x: number; y: number; width: number; height: number },
  halfStroke: number,
): number => {
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v))
  const cx = clamp(pad.x, Math.min(a.x, b.x), Math.max(a.x, b.x))
  const cy = clamp(pad.y, Math.min(a.y, b.y), Math.max(a.y, b.y))
  const nx = clamp(cx, pad.x - pad.width / 2, pad.x + pad.width / 2)
  const ny = clamp(cy, pad.y - pad.height / 2, pad.y + pad.height / 2)
  return Math.hypot(cx - nx, cy - ny) - halfStroke
}

test("quad corner silkscreen never overlaps pads (#734)", () => {
  for (const name of ["tqfp32_w7", "tqfp48_w7", "tqfp32", "lqfp32"]) {
    const circuitJson = fp.string(name).circuitJson()
    const pads = circuitJson.filter(
      (el: any) => el.type === "pcb_smtpad",
    ) as any[]
    const silks = circuitJson.filter(
      (el: any) => el.type === "pcb_silkscreen_path",
    ) as any[]

    let minClearance = Infinity
    for (const s of silks) {
      for (let i = 1; i < s.route.length; i++) {
        for (const pad of pads) {
          minClearance = Math.min(
            minClearance,
            segmentToPadClearance(s.route[i - 1], s.route[i], pad, 0.05),
          )
        }
      }
    }
    expect(
      minClearance,
      `${name}: silkscreen overlaps pads (clearance ${minClearance})`,
    ).toBeGreaterThanOrEqual(0.2)
  }
})
