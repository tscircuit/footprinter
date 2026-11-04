import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("sod123", () => {
  const soup = fp.string("sod123").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "sod123")
})

test("sod123 and sot723 draw a silkscreen outline that clears every pad", () => {
  // Both were the only members of their families shipping bare pads: every
  // other sod (sod123f/w/fl, sod323, sod523, sod923, sod128) and every other
  // SOT already drew a body outline.
  const footprints = [
    "sod123",
    "sot723",
    // Siblings, to prove the shared clearance rule isn't regressed.
    "sod123f",
    "sod123w",
    "sod123fl",
    "sod128",
    "sod323",
  ]

  const distanceToPad = (point: { x: number; y: number }, pad: any) => {
    const dx = Math.max(
      pad.x - pad.width / 2 - point.x,
      0,
      point.x - (pad.x + pad.width / 2),
    )
    const dy = Math.max(
      pad.y - pad.height / 2 - point.y,
      0,
      point.y - (pad.y + pad.height / 2),
    )
    return Math.sqrt(dx * dx + dy * dy)
  }

  for (const name of footprints) {
    const circuitJson = fp.string(name).circuitJson()
    const pads = circuitJson.filter((e) => e.type === "pcb_smtpad") as any[]
    const paths = circuitJson.filter(
      (e) => e.type === "pcb_silkscreen_path",
    ) as any[]

    expect({ name, hasSilkscreen: paths.length > 0 }).toEqual({
      name,
      hasSilkscreen: true,
    })

    let minClearance = Number.POSITIVE_INFINITY
    for (const path of paths) {
      const strokeHalfWidth = (path.stroke_width ?? 0) / 2
      for (let i = 0; i < path.route.length - 1; i++) {
        const a = path.route[i]
        const b = path.route[i + 1]
        for (let t = 0; t <= 1; t += 0.01) {
          const point = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }
          for (const pad of pads) {
            minClearance = Math.min(
              minClearance,
              distanceToPad(point, pad) - strokeHalfWidth,
            )
          }
        }
      }
    }

    expect(Number.isFinite(minClearance)).toBe(true)
    // IPC silkscreen-to-pad clearance, the same 0.2mm KiCad leaves.
    expect({ name, clears: minClearance >= 0.2 - 1e-6 }).toEqual({
      name,
      clears: true,
    })
  }
})
