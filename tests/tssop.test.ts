import { test, expect } from "bun:test"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { fp } from "../src/footprinter"

test("tssop", () => {
  const soup = fp.string("tssop8_w5.3mm_p1.27mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop8_w5.3mm_p1.27mm",
  )
})

test("tssop20_w6.5mm_p0.65mm", () => {
  const soup = fp.string("tssop20_w6.5mm_p0.65mm").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(
    import.meta.path,
    "tssop20_w6.5mm_p0.65mm",
  )
})

test("tssop8", () => {
  const soup = fp.string("tssop8").circuitJson()
  const svgContent = convertCircuitJsonToPcbSvg(soup)
  expect(svgContent).toMatchSvgSnapshot(import.meta.path, "tssop8")
})

test("tssop and sot457 silkscreen keeps clear of every pad", () => {
  // Both outlines used to be derived from `w` rather than from the pads that
  // were actually placed. Fine-pitch tssop shifts its pads inward, so the
  // outline drifted onto the copper (tssop10_w3mm_p0.5mm overlapped by
  // 0.025mm), and sot457's pin 1 marker was offset by a multiple of the pad
  // *width*, which lands on the pad when pl and pw are set independently.
  const footprints = [
    "tssop10_w3mm_p0.5mm",
    "tssop8",
    "tssop14",
    "tssop16",
    "tssop20",
    "tssop28",
    "tssop20_w6.5mm_p0.65mm",
    "sot457",
    "sot457_w2_pl1.5_pw0.6",
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

    expect(paths.length).toBeGreaterThan(0)

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
