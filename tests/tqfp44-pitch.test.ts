import { expect, test } from "bun:test"
import { fp } from "../src/footprinter"

/**
 * TQFP-44 is standardized as a 10x10mm body on 0.8mm pitch with 0.55mm-wide
 * leads (JEDEC MS-026 BBA; KiCad TQFP-44_10x10mm_P0.8mm uses 0.8mm pitch with
 * 1.475 x 0.55mm pads). It used to share the 0.5mm-pitch / 0.3mm-pad defaults
 * with TQFP-48/64/100, which matches no real TQFP-44 part.
 *
 * Issue #792: tqfp44 must default to the 0.8mm-pitch family, alongside
 * tqfp32. Explicit p/pw overrides must keep working.
 */

type Pad = { x: number; y: number; width: number; height: number }

const getPads = (cj: any[]): Pad[] =>
  cj
    .filter((e: any) => e.type === "pcb_smtpad")
    .map((e: any) => ({
      x: e.x,
      y: e.y,
      width: e.width,
      height: e.height,
    }))

const uniqueSorted = (vals: number[]) =>
  [...new Set(vals.map((v) => Math.round(v * 1e6) / 1e6))].sort((a, b) => a - b)

test("tqfp44 defaults to 0.8mm pitch on every side", () => {
  const pads = getPads(fp.string("tqfp44").circuitJson() as any)
  expect(pads.length).toBe(44)

  // 11 pad centers per side at 0.8mm pitch: centers at -4..+4 in 0.8mm steps
  // (the outermost ±6.6375 centers are the lead pads overhanging the body on
  // each of the 4 sides, one per side per axis-end)
  const xs = uniqueSorted(pads.map((p) => p.x))
  const ys = uniqueSorted(pads.map((p) => p.y))

  // All non-overhang centers sit on the 0.8mm grid: -4, -3.2, ... +4
  const onGrid = (coords: number[]) =>
    coords
      .filter((c) => Math.abs(c) < 6) // exclude the ±6.6375 lead overhangs
      .map((c) => Math.round((c / 0.8) * 1e6) / 1e6)
  for (const c of [...onGrid(xs), ...onGrid(ys)]) {
    expect(c % 1).toBeCloseTo(0, 6)
  }
  // The grid spans exactly 8mm: 10 pitch spaces * 0.8mm
  const innerXs = xs.filter((c) => Math.abs(c) < 6)
  const innerYs = ys.filter((c) => Math.abs(c) < 6)
  expect(innerXs[innerXs.length - 1]! - innerXs[0]!).toBeCloseTo(8, 6)
  expect(innerYs[innerYs.length - 1]! - innerYs[0]!).toBeCloseTo(8, 6)
  // And the overhang rows sit exactly one pad-length beyond the grid ends:
  // 4 + 1.475/2 + (body half-size math handled by quad) — assert stable value
  expect(xs[0]!).toBeCloseTo(-6.6375, 6)
  expect(xs[xs.length - 1]!).toBeCloseTo(6.6375, 6)
})

test("tqfp44 pad width defaults to 0.55mm like tqfp32", () => {
  const pads44 = getPads(fp.string("tqfp44").circuitJson() as any)
  const widths44 = [
    ...new Set(pads44.map((p) => Math.round((p.width + p.height) * 1e6) / 1e6)),
  ]
  // Each pad: 1.475 long + 0.55 wide = 2.025 (pill/rect per quad.ts layout)
  expect(widths44).toContain(2.025)

  const pads32 = getPads(fp.string("tqfp32").circuitJson() as any)
  const widths32 = [
    ...new Set(pads32.map((p) => Math.round((p.width + p.height) * 1e6) / 1e6)),
  ]
  expect(widths44).toEqual(widths32)
})

test("tqfp44_w10 explicit p/pw overrides still win over defaults", () => {
  const pads = getPads(
    (fp.string("tqfp44_w10") as any).p("0.5mm").pw("0.3mm").circuitJson(),
  )
  expect(pads.length).toBe(44)
  const widths = [
    ...new Set(pads.map((p) => Math.round((p.width + p.height) * 1e6) / 1e6)),
  ]
  expect(widths).toContain(1.775) // 1.475 + 0.3
})

test("tqfp48/64/100 keep the 0.5mm pitch / 0.3mm pad defaults", () => {
  for (const n of [48, 64, 100]) {
    const pads = getPads(fp.string(`tqfp${n}`).circuitJson() as any)
    expect(pads.length).toBe(n)
    const widths = [
      ...new Set(pads.map((p) => Math.round((p.width + p.height) * 1e6) / 1e6)),
    ]
    // 1.475 + 0.3 = 1.775
    expect(widths).toContain(1.775)
  }
})
