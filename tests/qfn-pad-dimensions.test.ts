import { test, expect } from "bun:test"
import { fp } from "../src/footprinter"

test("QFN-32 pads are positioned at package body edge (IPC-7351B)", () => {
  // QFN-32 with explicit 5x5mm body: 8 pads per side, 0.5mm pitch
  const circuitJson = fp.string("qfn32_w5mm").circuitJson()
  const pads = circuitJson.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(32)

  // Left-side pads: those with x at the left body edge (-2.5mm)
  // width=0.875 (along x-axis), height=0.25 (along y-axis)
  const leftSidePads = (pads as any[]).filter(
    (p) => Math.abs(p.x - -2.5) < 0.05,
  )
  expect(leftSidePads.length).toBe(8) // 8 pads on left side

  // Each pad's center should be at the body edge
  for (const pad of leftSidePads) {
    expect(Math.abs(pad.x - -2.5)).toBeLessThan(0.05)
    // Pad should extend beyond the body
    const leftEdge = pad.x - pad.width / 2
    expect(leftEdge).toBeLessThan(-2.5)
  }
})

test("QFN-32 pads extend outside the package body", () => {
  const circuitJson = fp.string("qfn32_w5mm").circuitJson()
  const pads = circuitJson.filter((e: any) => e.type === "pcb_smtpad")

  // Left-side pads
  const leftSidePads = (pads as any[]).filter(
    (p) => Math.abs(p.x - -2.5) < 0.05,
  )
  for (const pad of leftSidePads) {
    const leftEdge = pad.x - pad.width / 2
    expect(leftEdge).toBeLessThan(-2.5)
  }
})

test("QFN pads have valid non-zero dimensions", () => {
  const circuitJson = fp.string("qfn32").circuitJson()
  const pads = circuitJson.filter((e: any) => e.type === "pcb_smtpad")
  expect(pads.length).toBe(32)

  for (const pad of pads) {
    expect((pad as any).width).toBeGreaterThan(0)
    expect((pad as any).height).toBeGreaterThan(0)
  }
})
